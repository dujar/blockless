import { createContext } from 'react';
import type { useCrossChainContextHook } from '../hooks/useCrossChainContext';

export const ChainContext = createContext<ReturnType<typeof useCrossChainContextHook>|undefined>(undefined);

export type ChainContextType = ReturnType<typeof useCrossChainContextHook>;