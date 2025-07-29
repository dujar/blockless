import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConnect, useSwitchChain, useDisconnect } from 'wagmi';
import { useMerchantConfig } from '../../../hooks/useMerchantConfig';
import { blockchainData } from '../../../data/blockchains';
import { TokenService } from '../../../services/token-service';
import type { MerchantChainConfig } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';
import { countries } from '../../../data/countries';

const tokenService = new TokenService();
const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

export const useRegistrationForm = () => {
  const { config, saveConfig, isLoaded } = useMerchantConfig();
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [chains, setChains] = useState<MerchantChainConfig[]>([]);
  const [addressValidity, setAddressValidity] = useState<Record<string, boolean | null>>({});

  const { address: accountAddress, chain: accountChain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  const currenciesData = useMemo(() => {
    const currencies: Record<string, { name: string; symbol: string; countries: { name: string; flag: string }[] }> = {};
  
    if (Array.isArray(countries)) {
      countries.forEach(country => {
        if (!country.currencies || Object.keys(country.currencies).length === 0) return;
        
        for (const code in country.currencies) {
          const currency = (country.currencies as any)[code];
          if (!currency || !currency.name || !currency.symbol) continue;

          if (!currencies[code]) {
            currencies[code] = {
              name: currency.name,
              symbol: currency.symbol,
              countries: [],
            };
          }
          if (country.flags.svg) {
            currencies[code].countries.push({
              name: country.name.common,
              flag: country.flags.svg,
            });
          }
        }
      });
    }
  
    return Object.entries(currencies)
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  
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

  useEffect(() => {
    if (isLoaded && config) {
      setFiatCurrency(config.fiatCurrency);
      setChains(config.chains);
      const validity: Record<string, boolean | null> = {};
      config.chains.forEach(chain => {
        validity[chain.name] = isValidAddress(chain.address);
      });
      setAddressValidity(validity);
    }
  }, [isLoaded, config]);

  const debouncedState = useDebounce({ fiatCurrency, chains }, 500);

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
    if (isConnected && accountAddress && accountChain) {
      const chainInfo = blockchainData.find(b => b.chainId === accountChain.id);
      if (chainInfo) {
        const currentChainConfig = chains.find(c => c.name === chainInfo.name);
        // Only update if the chain is enabled and the address is different
        if (currentChainConfig && currentChainConfig.address !== accountAddress) {
          handleAddressChange(chainInfo.name, accountAddress);
        }
      }
    }
  }, [isConnected, accountAddress, accountChain, chains, handleAddressChange]);

  const handleUseWallet = useCallback((chainInfo: (typeof import('../../../data/blockchains').blockchainData)[0]) => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    } else {
      if (accountChain?.id !== chainInfo.chainId) {
        if (chainInfo.chainId) {
          switchChain({ chainId: chainInfo.chainId });
        }
      } else if (accountAddress) {
        handleAddressChange(chainInfo.name, accountAddress);
      }
    }
  }, [isConnected, connect, connectors, accountChain, switchChain, accountAddress, handleAddressChange]);

  const handleChainChange = (chainName: string, isChecked: boolean) => {
    setChains(prev => {
      if (isChecked) {
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
            ? [...new Set([...c.tokens, tokenSymbol])]
            : c.tokens.filter(t => t !== tokenSymbol);
          return { ...c, tokens: newTokens };
        }
        return c;
      })
    );
  };
  
  return {
    isLoaded: isLoaded && !isLoadingSupportedChains,
    fiatCurrency,
    setFiatCurrency,
    chains,
    addressValidity,
    handleAddressChange,
    handleChainChange,
    handleTokenChange,
    currenciesData,
    supportedChains: supportedChains.length > 0 ? supportedChains : blockchainData.filter(c => c.isEVM), // Fallback
    
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
