import path from 'path';
import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { ethers } from 'ethers';
import { build, runRpc, parseSettings, loadCannonfile, resolveCliSettings, createDryRunRegistry } from '@usecannon/cli';
import { getProvider } from '@usecannon/cli/dist/src/rpc';
import { CannonWrapperGenericProvider } from '@usecannon/builder';
import { HttpNetworkConfig } from 'hardhat/types';
import { yellow } from 'chalk';
import { SUBTASK_GET_ARTIFACT, TASK_BUILD } from '../task-names';
import { CANNON_NETWORK_NAME } from '../constants';
import { augmentProvider } from '../internal/augment-provider';
import { getHardhatSigners } from '../internal/get-hardhat-signers';
import { loadPackageJson } from '../internal/load-pkg-json';
import { pickAnvilOptions } from '@usecannon/cli/dist/src/util/anvil';
import * as fs from 'fs-extra';

task(TASK_BUILD, 'Assemble a defined chain and save it to to a state which can be used later')
  .addPositionalParam('cannonfile', 'Path to a cannonfile to build', 'cannonfile.toml')
  .addOptionalVariadicPositionalParam('settings', 'Custom settings for building the cannonfile', [])
  .addOptionalParam('preset', '(Optional) The preset label for storing the build with the given settings')
  .addOptionalParam('registryPriority', '(Optional) Which registry should be used first? Default: onchain')
  .addOptionalParam(
    'anvilOptions',
    '(Optional) Custom anvil options json file to configure when running on the cannon network or a local forked node'
  )
  .addFlag('dryRun', 'Run a shadow deployment on a local forked node instead of actually deploying')
  .addFlag('wipe', 'Do not reuse any previously built artifacts')
  .addFlag('usePlugins', 'Load plugins globally installed using the cannon CLI')
  .addOptionalParam(
    'upgradeFrom',
    '(Optional) Wipe the deployment files, and use the deployment files from another cannon package as base'
  )
  .addOptionalParam('impersonate', '(Optional) When dry running, uses forked signers rather than actual signing keys')
  .addFlag('noCompile', 'Do not execute hardhat compile before build')
  .setAction(
    async (
      {
        cannonfile,
        settings,
        upgradeFrom,
        preset,
        noCompile,
        wipe,
        usePlugins,
        registryPriority,
        dryRun,
        anvilOptions,
        impersonate,
      },
      hre
    ) => {
      if (!noCompile) {
        await hre.run(TASK_COMPILE);
        console.log('');
      }

      // If the first param is not a cannonfile, it should be parsed as settings
      if (typeof cannonfile === 'string' && cannonfile !== '-' && !cannonfile.endsWith('.toml')) {
        settings.unshift(cannonfile);
        cannonfile = 'cannonfile.toml';
      }

      const parsedSettings = parseSettings(settings);

      let anvilOpts;
      if (anvilOptions) {
        if ((anvilOptions as string).endsWith('.json')) {
          anvilOpts = JSON.parse(await fs.readFileSync(anvilOptions, 'utf8'));
        } else {
          anvilOpts = JSON.parse(anvilOptions);
        }
      }
      anvilOpts = pickAnvilOptions(anvilOpts);

      const { name, version, def } = await loadCannonfile(path.join(hre.config.paths.root, cannonfile));

      const providerUrl = (hre.network.config as HttpNetworkConfig).url;

      let provider = new CannonWrapperGenericProvider({}, new ethers.providers.JsonRpcProvider(providerUrl));

      if (hre.network.name === 'hardhat') {
        if (dryRun) {
          throw new Error('You cannot use --dry-run param when using the "hardhat" network');
        }

        // hardhat network is "special" in that it looks like its a jsonrpc provider,
        // but really you can't use it like that.
        console.log('using hardhat network provider');
        provider = new CannonWrapperGenericProvider({}, hre.ethers.provider, false);
      }

      if (dryRun || hre.network.name === 'cannon') {
        const node = dryRun
          ? await runRpc(
              {
                port: hre.config.networks.cannon.port,
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                accounts: anvilOpts.accounts || 10,
                ...anvilOpts,
              },
              {
                forkProvider: new ethers.providers.JsonRpcProvider(providerUrl),
              }
            )
          : await runRpc({ port: hre.config.networks.cannon.port, accounts: anvilOpts.accounts || 10, ...anvilOpts });

        provider = getProvider(node);
      }

      const signers = getHardhatSigners(hre, provider);

      const getSigner = async (addr: string) => {
        addr = addr.toLowerCase();
        for (const signer of signers) {
          const signerAddr = await signer.getAddress();
          if (addr === signerAddr.toLowerCase()) return signer.connect(provider);
        }
      };

      let defaultSigner: ethers.Signer | null = null;
      if (impersonate) {
        await provider.send('hardhat_impersonateAccount', [impersonate]);
        await provider.send('hardhat_setBalance', [impersonate, `0x${(1e22).toString(16)}`]);
        defaultSigner = (await getSigner(impersonate)) || null;
        // Add the impersonated signer if it is not part of the hardhat config
        if (!defaultSigner) {
          defaultSigner = provider.getSigner(impersonate);
          signers.push(defaultSigner);
        }
      } else if (hre.network.name !== CANNON_NETWORK_NAME) {
        defaultSigner = signers[0].connect(provider);
      }

      if (defaultSigner) {
        // print out any live deployment info that might be relevant
        console.log(yellow(`default signer is ${await defaultSigner.getAddress()}`));
      }

      const params = {
        provider,
        def,
        packageDefinition: {
          name,
          version,
          settings: parsedSettings,
        },
        getArtifact: async (contractName: string) => await hre.run(SUBTASK_GET_ARTIFACT, { name: contractName }),
        async getSigner(addr: string) {
          if (impersonate || hre.network.name === 'cannon' || hre.network.name === 'hardhat') {
            // on test network any user can be conjured
            await provider.send('hardhat_impersonateAccount', [addr]);
            await provider.send('hardhat_setBalance', [addr, `0x${(1e22).toString(16)}`]);
            return provider.getSigner(addr);
          } else {
            // return the actual signer with private key
            const signer = await getSigner(addr);
            if (signer) return signer;

            throw new Error(
              `the current step requests usage of the signer with address ${addr}, but this signer is not found. Please either supply the private key, or change the cannon configuration to use a different signer.`
            );
          }
        },
        getDefaultSigner: defaultSigner ? async () => defaultSigner! : undefined,
        pkgInfo: loadPackageJson(path.join(hre.config.paths.root, 'package.json')),
        projectDirectory: hre.config.paths.root,
        preset,
        upgradeFrom,
        wipe,
        registryPriority,
        persist: !dryRun && hre.network.name !== 'hardhat',
        overrideResolver: dryRun ? await createDryRunRegistry(resolveCliSettings()) : undefined,
        plugins: !!usePlugins,
        publicSourceCode: hre.config.cannon.publicSourceCode,
      } as const;

      const { outputs } = await build(params);

      if (hre.network.name === 'hardhat') {
        console.log(
          yellow(
            'Keep in mind that regardless this package was succefully built, it was not saved because the "hardhat" network is being used. If this is not what you want, consider using --network cannon'
          )
        );
      }

      await augmentProvider(hre, outputs);
      provider.artifacts = outputs;

      return { outputs, provider, signers };
    }
  );
