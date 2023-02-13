import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const ethers = require("ethers");

const INFURA_ID = "2ec6e503197e468ca2f04b8a017ee1b0";

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: INFURA_ID
        }
    }
};

const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions
});

let metamaskProvider;

export const state = () => ({
    providerOptions,
    chainId: 0,
    account: null
})

export const getters = {
    getProvider(state) {
        if (metamaskProvider) {
            return metamaskProvider
        }
        if (state.chainId == 13370) {
            return new ethers.providers.JsonRpcProvider('http://localhost:8545')
        }
        if (state.chainId == 420) {
            return new ethers.providers.JsonRpcProvider('https://goerli.optimism.io')
        }
        return ethers.getDefaultProvider(ethers.providers.getNetwork(state.chainId), { infura: INFURA_ID })
    },
    getChainId(state) {
        return state.chainId
    }
}

export const mutations = {
    setChainId(state, chainId) {
        state.chainId = chainId
    },
    setAccount(state, account) {
        state.account = account
    }
}

export const actions = {
    async connect({ state, commit }, toast) {
        const instance = await web3Modal.connect();
        metamaskProvider = new ethers.providers.Web3Provider(instance, "any");

        metamaskProvider.on('accountsChanged', function (accounts) {
            commit('setAccount', accounts[0]);
        });

        let accounts = await metamaskProvider.send("eth_requestAccounts", []);
        commit('setAccount', accounts[0]);

        if (state.chainId) {
            await switchMetamaskChain(state.chainId, toast)
        }
    },
    async disconnect({ state, commit }, toast) {
        web3Modal.clearCachedProvider();
        metamaskProvider = null;
        commit('setAccount', null);
    },
    async changeChainId({ state, commit }, chainId, toast) {
        if (state.account) {
            await switchMetamaskChain(chainId, toast)
        }

        commit('setChainId', chainId);
    }
}

const switchMetamaskChain = async (chainId, toast) => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + chainId.toString(16) }],    // chainId must be in HEX with 0x in front
        });
    } catch (error) {
        toast({
            title: 'Error',
            description: error.message,
            status: 'error',
            duration: 10000
        })
        return
    }
}