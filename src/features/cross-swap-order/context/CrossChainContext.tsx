import { useContext } from 'react';
import { ChainContext } from './ChainContext';

export const useChainContext = () => {
    const context = useContext(ChainContext);
    if (!context) {
        throw new Error('useChainContext must be used within a ChainProvider');
    }

    return context;
};