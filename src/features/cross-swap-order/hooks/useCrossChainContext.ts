import { useState, useMemo } from 'react';
import { useSupportedChains } from '../hooks/useSupportedChains';
import { useSearchParams } from 'react-router-dom';
import { getChainById } from '../../../utils/chain-helpers';
import type { BlockchainData } from '../../../data/blockchains';

interface StepsStruct {
    [key: string]: {
        [key: string]: unknown;
    };
};

export const useCrossChainContextHook = ()=>{
    const [searchParams] = useSearchParams();
    const [chain, setChain] = useState<BlockchainData | null>(null);
    const chainResponse = useSupportedChains();
    const [steps, setSteps] = useState<StepsStruct>({});

    const params =searchParams.getAll('dst');
    const orders = useMemo(() => {
        return params.map((param) => {
            param.split(':');
            //TODO: remove this mock
            return {
                orderHash: '0x123',
                signature: '0x123',
                deadline: 123,
                auctionStartDate: 123,
                auctionEndDate: 123,
                quoteId: '0x123',
                remainingMakerAmount: '123',
                makerBalance: '123',
                makerAllowance: '123',
                isMakerContract: false,
                extension: '0x123',
                srcChainId: 1,
                dstChainId: 1,
                order: {
                    salt: '0x123',
                    makerAsset: '0x123',
                    takerAsset: '0x123',
                    maker: '0x123',
                    receiver: '0x123',
                    makingAmount: '123',
                    takingAmount: '123',
                    makerTraits: '0x123',
                },
                secretHashes: [],
                fills: [],
            }
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
        getChainById,
    };

    return contextValue;
}