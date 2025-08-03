import { blockchainData } from '../data/blockchains';

export const chainsByNetworkId = blockchainData.reduce((acc: { [key: number]: typeof blockchainData[number]}, chain) => {
    acc[chain.networkId] = {
        ...chain,
        id: chain.networkId +"",
    };
    return acc;
}, {} as Record<number, typeof blockchainData[number]>);

export const getChainById = (chainId: number) => chainsByNetworkId[chainId] || null;