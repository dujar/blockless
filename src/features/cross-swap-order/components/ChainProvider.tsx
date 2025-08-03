import React from 'react';
import { ChainContext } from '../context/ChainContext';
import { useCrossChainContextHook } from '../hooks/useCrossChainContext';

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const contextValue = useCrossChainContextHook();
    return (
        <ChainContext.Provider value={contextValue}>
            {children}
        </ChainContext.Provider>
    );
};