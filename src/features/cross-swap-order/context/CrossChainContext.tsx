import React, { createContext, useContext, useState, useMemo } from 'react';
import { blockchainData, type BlockchainData } from '../../../data/blockchains';
import { useSupportedChains } from '../hooks/useSupportedChains';
import { useSearchParams } from 'react-router-dom';

const ChainContext = createContext<ReturnType<typeof useHook>|undefined>(undefined);

const chainsByNetworkId = blockchainData.reduce((acc: { [key: number]: typeof blockchainData[number]}, chain) => {
    acc[chain.networkId] = {
        ...chain,
        id: chain.networkId +"",
        // nativeCurrency: chain.nativeCurrency,
    };
    return acc;
}, {} as Record<number, typeof blockchainData[number]>);
const chainsByNetworkName = blockchainData.reduce((acc: { [key: string]: typeof blockchainData[number]}, chain) => {
    acc[chain.name.toLocaleLowerCase() + ""] = {
        ...chain,
        id: chain.networkId +"",
        // nativeCurrency: chain.nativeCurrency,
    };
    return acc;
}, {} as Record<string, typeof blockchainData[number]>);

interface StepsStruct {
    [key: string]: {
        [key: string]: any;
    };
};
const useHook = ()=>{
    const [searchParams] = useSearchParams();
    const [chain, setChain] = useState<BlockchainData | null>(null);
    const chainResponse = useSupportedChains();
    const [steps, setSteps] = useState<StepsStruct>({});

    const params =searchParams.getAll('dst');
    let orders = useMemo(() => {
        return params.map((param) => {
            const [chainName,amount,token ,dstAddress] = param.split(':');
            return {
                dstAddress,
                token,
                amount: parseFloat(amount||"0"),
                chain: chainsByNetworkName[chainName.toLocaleLowerCase()],
            };
        });
    }, [params]);
    const contextValue = {
        orders,
        steps,
        setSteps,
        params,
        chain,
        chainResponse,
        setChain,
        getChainById: (chainId: number) => chainsByNetworkId[chainId] || null,
    };

    return contextValue;
}
export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const contextValue = useHook();
    return (
        <ChainContext.Provider value={contextValue}>
            {children}
        </ChainContext.Provider>
    );
};
export type ChainContextType = ReturnType<typeof useHook>;
export const useChainContext = () => {
    const context = useContext(ChainContext);
    if (!context) {
        throw new Error('useChainContext must be used within a ChainProvider');
    }

    return context;
};
