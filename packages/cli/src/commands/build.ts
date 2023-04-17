import _ from 'lodash';
import ethers from 'ethers';
import { table } from 'table';
import { bold, greenBright, green, dim, red, yellow, blueBright, gray, cyanBright } from 'chalk';
import {
  CANNON_CHAIN_ID,
  ChainDefinition,
  ContractArtifact,
  Events,
  ChainBuilderRuntime,
  build as cannonBuild,
  createInitialContext,
  getOutputs,
  DeploymentInfo,
  CannonWrapperGenericProvider,
  registerAction,
} from '@usecannon/builder';
import { loadCannonfile, readMetadataCache, saveToMetadataCache } from '../helpers';
import { PackageSpecification } from '../types';
import { printChainBuilderOutput } from '../util/printer';
import { CannonRegistry } from '@usecannon/builder';
import { resolveCliSettings } from '../settings';
import { createDefaultReadRegistry } from '../registry';

import { listInstalledPlugins, loadPlugin } from '../plugins';
import { getIpfsLoader } from '../util/loader';

interface Params {
  provider: CannonWrapperGenericProvider;
  cannonfilePath?: string;
  packageDefinition: PackageSpecification;
  upgradeFrom?: string;
  pkgInfo: any;

  getArtifact?: (name: string) => Promise<ContractArtifact>;
  getSigner?: (addr: string) => Promise<ethers.Signer>;
  getDefaultSigner?: () => Promise<ethers.Signer>;
  projectDirectory?: string;
  preset?: string;
  chainId?: number;
  overrideResolver?: CannonRegistry;
  wipe?: boolean;
  persist?: boolean;
  plugins?: boolean;
  publicSourceCode?: boolean;
}

export async function build({
  provider,
  cannonfilePath,
  packageDefinition,
  upgradeFrom,
  pkgInfo,
  getArtifact,
  getSigner,
  getDefaultSigner,
  projectDirectory,
  preset = 'main',
  overrideResolver,
  wipe = false,
  persist = true,
  plugins = true,
  publicSourceCode = false,
}: Params) {
  if (wipe && upgradeFrom) {
    throw new Error('wipe and upgradeFrom are mutually exclusive. Please specify one or the other');
  }

  const cliSettings = resolveCliSettings();

  if (plugins) {
    const pluginList = await listInstalledPlugins();

    if (pluginList.length) {
      for (const plugin of pluginList) {
        const pluginAction = await loadPlugin(plugin);

        if (Array.isArray(pluginAction)) {
          for (const action of pluginAction) registerAction(action);
        } else {
          registerAction(pluginAction);
        }
      }
    }
  }

  const chainId = (await provider.getNetwork()).chainId;

  const runtimeOptions = {
    provider,
    chainId,

    getArtifact,

    getSigner:
      getSigner ||
      async function (addr: string) {
        // on test network any user can be conjured
        await provider.send('hardhat_impersonateAccount', [addr]);
        await provider.send('hardhat_setBalance', [addr, `0x${(1e22).toString(16)}`]);
        return provider.getSigner(addr);
      },

    getDefaultSigner,

    baseDir: projectDirectory || null,
    snapshots: chainId === CANNON_CHAIN_ID,
    allowPartialDeploy: chainId !== CANNON_CHAIN_ID && persist,
    publicSourceCode,
  };

  const resolver = overrideResolver || (await createDefaultReadRegistry(cliSettings));

  const runtime = new ChainBuilderRuntime(runtimeOptions, getIpfsLoader(cliSettings.ipfsUrl, resolver));

  let partialDeploy = false;
  runtime.on(Events.PreStepExecute, (t, n, _c, d) => console.log(`${'  '.repeat(d)}exec: ${t}.${n}`));
  runtime.on(Events.SkipDeploy, (n, err, d) => {
    partialDeploy = true;
    console.log(`${'  '.repeat(d)}  -> skip ${n} (${err.toString()})`);
  });

  // Check for existing package
  let oldDeployData: DeploymentInfo | null = null;
  const prevPkg = upgradeFrom || `${packageDefinition.name}:${packageDefinition.version}`;

  console.log(bold(`Checking IPFS for package ${prevPkg}...`));
  oldDeployData = await runtime.loader.readDeploy(prevPkg, preset || 'main', runtime.chainId);

  // Update pkgInfo (package.json) with information from existing package, if present
  if (oldDeployData) {
    console.log('Existing package found.');
    await runtime.restoreMisc(oldDeployData.miscUrl);

    if (!pkgInfo) {
      pkgInfo = oldDeployData.meta;
    }
  } else {
    console.log('No existing package found.');
  }
  console.log('');

  let pkgName, pkgVersion;
  let def: ChainDefinition;
  if (cannonfilePath) {
    const { def: overrideDef, name, version, cannonfile } = await loadCannonfile(cannonfilePath);

    if (!name) {
      throw new Error(red('Your cannonfile is missing a name. Add one to the top of the file like: name = "my-package"'));
    }

    if (!version) {
      throw new Error(red('Your cannonfile is missing a version. Add one to the top of the file like: version = "1.0.0"'));
    }

    if (name !== packageDefinition.name || version !== packageDefinition.version) {
      throw new Error(red('Your cannonfile manifest does not match requseted packageDefinitionDeployment'));
    }

    await saveToMetadataCache(`${name}:${version}`, 'cannonfile', cannonfile);

    pkgName = name;
    pkgVersion = version;

    def = overrideDef;
  } else if (oldDeployData) {
    def = new ChainDefinition(oldDeployData.def);
  } else {
    throw new Error(
      red(
        'No deployment definition found. Make sure you have a recorded deployment for the requested cannon package, or supply a cannonfile to build one.'
      )
    );
  }

  const wiping = oldDeployData && wipe;
  const upgradingMsg = upgradeFrom ? ` (extending ${upgradeFrom})` : '';
  if (wiping) {
    console.log(bold(`Regenerating package...`) + upgradingMsg);
  } else if (oldDeployData) {
    console.log(bold(`Continuing with package...`) + upgradingMsg);
  } else {
    console.log(bold(`Generating new package...`) + upgradingMsg);
  }
  console.log(`Package Name: ` + cyanBright(`${pkgName}`));
  console.log(`Version: ` + cyanBright(`${pkgVersion}`));
  console.log(`Preset: ` + cyanBright(`${preset}${preset == 'main' ? ' (default)' : ''}`));
  if (publicSourceCode) {
    console.log(`Source code will be included in the package.`);
  }
  console.log('');

  console.log(
    bold(
      `${
        overrideResolver == undefined ? 'Building' : 'Running a simulated build of'
      } the chain (ID ${chainId}) into the state defined in ${cannonfilePath?.split('/').pop()}...`
    )
  );
  if (!_.isEmpty(packageDefinition.settings)) {
    console.log(`Overriding the default values for the cannonfile's settings with the following:`);
    for (const [key, value] of Object.entries(packageDefinition.settings)) {
      console.log(`  - ${key} = ${value}`);
    }
    console.log('');
  }

  if (plugins) {
    const pluginList = await listInstalledPlugins();

    if (pluginList.length) {
      console.log('plugins:', pluginList.join(', '), ' detected');
    }
  }

  const resolvedSettings = _.assign(oldDeployData?.options ?? {}, packageDefinition.settings);

  const initialCtx = await createInitialContext(def, pkgInfo, chainId, resolvedSettings);

  const newState = await cannonBuild(runtime, def, oldDeployData ? oldDeployData.state : {}, initialCtx);

  const outputs = (await getOutputs(runtime, def, newState))!;

  // save the state to ipfs
  const miscUrl = await runtime.recordMisc();

  if (miscUrl) {
    const deployUrl = await runtime.loader.putDeploy({
      def: def.toJson(),
      state: newState,
      options: resolvedSettings,
      status: partialDeploy ? 'partial' : 'complete',
      meta: pkgInfo,
      miscUrl: miscUrl,
    });

    const metaUrl = await runtime.loader.putMisc(await readMetadataCache(`${pkgName}:${pkgVersion}`));

    if (persist) {
      await resolver.publish(
        [`${packageDefinition.name}:latest`, `${packageDefinition.name}:${packageDefinition.version}`],
        `${runtime.chainId}-${preset}`,
        deployUrl!,
        metaUrl!
      );
    }

    if (partialDeploy) {
      console.log(
        yellow(
          bold(
            'WARNING: your deployment was not fully completed. Please inspect the issues listed above, and resolve as necessary.'
          )
        )
      );

      console.log(
        yellow(`This package is not published. Your partial deployment can be accessed from the URL: ${deployUrl}`)
      );
    } else {
      console.log(
        greenBright(
          `Successfully built package ${bold(`${packageDefinition.name}:${packageDefinition.version}`)} (${deployUrl})`
        )
      );
    }
  } else {
    console.log(
      bold(yellow('Chain state could not be saved. Run `npx @usecannon/cli setup` to set up your IPFS connection.'))
    );
  }

  printChainBuilderOutput(outputs);

  provider.artifacts = outputs;

  return { outputs, provider };
}
