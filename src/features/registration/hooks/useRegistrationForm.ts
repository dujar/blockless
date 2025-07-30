import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMerchantConfig } from '../../../hooks/useMerchantConfig';
import { blockchainData } from '../../../data/blockchains';
import { TokenService } from '../../../services/token-service';
import type { MerchantChainConfig } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';
import { countries } from '../../../data/countries';
import { getCurrencyDataFromCountries } from '../../../utils/token-helpers'; // Import the new helper

const tokenService = new TokenService();
const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

export const useRegistrationForm = () => {
  const { config, saveConfig, isLoaded } = useMerchantConfig();

  // Initialize state directly from the loaded config.
  // If config is null (no saved data), it defaults to 'USD' and an empty array.
  const [fiatCurrency, setFiatCurrency] = useState(config?.fiatCurrency || 'USD');
  const [chains, setChains] = useState<MerchantChainConfig[]>(config?.chains || []);
  
  // Recalculate address validity based on the initial loaded chains.
  const [addressValidity, setAddressValidity] = useState<Record<string, boolean | null>>(() => {
    const initialValidity: Record<string, boolean | null> = {};
    config?.chains.forEach(chain => {
      initialValidity[chain.name] = isValidAddress(chain.address);
    });
    return initialValidity;
  });

  const { address: accountAddress, chain: accountChain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Use the new helper function for currenciesData
  const currenciesData = useMemo(() => getCurrencyDataFromCountries(countries), []);
  
  const { data: supportedChainsData, isLoading: isLoadingSupportedChains } = useQuery({
      queryKey: ['supportedChains'],
      queryFn: () => tokenService.getSupportedChains(),
  });

  const supportedChains = useMemo(() => {
    if (!supportedChainsData) return [];
    
    let chainIds: number[] = [];
    // Assuming the response is an object with a `chains` property which is an array of numbers (chain IDs).
    if (supportedChainsData && Array.isArray(supportedChainsData)) {
        chainIds = supportedChainsData;
    }
    
    return blockchainData.filter(chain => chain.isEVM && chain.chainId && chainIds.includes(chain.chainId));
  }, [supportedChainsData]);

  // Use debounced state for saving to localStorage to prevent excessive writes.
  const debouncedState = useDebounce({ fiatCurrency, chains }, 500);

  // Save the debounced state to localStorage whenever it changes, and the config is loaded.
  // 'isLoaded' from useMerchantConfig will be true after its synchronous read.
  useEffect(() => {
    if (isLoaded) { 
      saveConfig(debouncedState);
    }
  }, [debouncedState, isLoaded, saveConfig]);

  const handleAddressChange = useCallback((chainName: string, address: string) => {
    setChains(prev => prev.map(c => (c.name === chainName ? { ...c, address } : c)));
    setAddressValidity(prev => ({
      ...prev,
      [chainName]: address ? isValidAddress(address) : null,
    }));
  }, []);

  useEffect(() => {
    // Automatically update the address for the connected EVM chain if it's already configured
    if (isConnected && accountAddress && accountChain) {
      const chainInfo = blockchainData.find(b => b.chainId === accountChain.id);
      if (chainInfo && chainInfo.isEVM) { // Only auto-fill for EVM chains
        const currentChainConfig = chains.find(c => c.name === chainInfo.name);
        // Only update if the chain is enabled and the address is different
        // Ensure the found chain config's address is different (case-insensitive) before updating to avoid unnecessary state changes
        if (currentChainConfig && currentChainConfig.address.toLowerCase() !== accountAddress.toLowerCase()) {
          handleAddressChange(chainInfo.name, accountAddress);
        }
      }
    }
  }, [isConnected, accountAddress, accountChain, chains, handleAddressChange]);

  const handleUseWallet = useCallback((chainInfo: (typeof import('../../../data/blockchains').blockchainData)[0]) => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    } else {
        // If connected, simply use the connected wallet's address if the target configured chain is EVM.
        if (chainInfo.isEVM && accountAddress) {
            handleAddressChange(chainInfo.name, accountAddress);
        } else if (!chainInfo.isEVM) {
            // Warn if trying to use EVM wallet for a non-EVM chain; button should be disabled for this case in UI
            console.warn(`Cannot use EVM wallet for non-EVM chain: ${chainInfo.name}`);
        }
    }
  }, [isConnected, connect, connectors, accountAddress, handleAddressChange]);

  const handleChainChange = (chainName: string, isChecked: boolean) => {
    setChains(prev => {
      if (isChecked) {
        // Prevent adding duplicate chains
        if (prev.some(c => c.name === chainName)) {
            return prev;
        }
        return [...prev, { name: chainName, address: '', tokens: [] }];
      } else {
        const newChains = prev.filter(c => c.name !== chainName);
        setAddressValidity(v => {
          const newV = { ...v };
          delete newV[chainName];
          return newV;
        });
        return newChains;
      }
    });
  };

  const handleTokenChange = (chainName: string, tokenSymbol: string, isChecked: boolean) => {
    setChains(prev =>
      prev.map(c => {
        if (c.name === chainName) {
          const newTokens = isChecked
            ? [...new Set([...c.tokens, tokenSymbol])] // Add token if checked, ensure uniqueness
            : c.tokens.filter(t => t !== tokenSymbol); // Remove token if unchecked
          return { ...c, tokens: newTokens };
        }
        return c;
      })
    );
  };
  
  return {
    isLoaded: isLoaded && !isLoadingSupportedChains, // 'isLoaded' from useMerchantConfig will be true after synchronous read
    fiatCurrency,
    setFiatCurrency,
    chains,
    addressValidity,
    handleAddressChange,
    handleChainChange,
    handleTokenChange,
    currenciesData, // Now directly from the helper
    supportedChains: supportedChains.length > 0 ? supportedChains : blockchainData.filter(c => c.isEVM), // Fallback if API fails
    
    wallet: {
      isConnected,
      address: accountAddress,
      chain: accountChain,
      disconnect,
      handleUseWallet,
    }
  };
};

export type UseRegistrationFormReturn = ReturnType<typeof useRegistrationForm>;

