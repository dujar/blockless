import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMerchantConfig } from '../../../hooks/useMerchantConfig';
import { blockchainData } from '../../../data/blockchains';
import { TokenService } from '../../../services/token-service';
import type { MerchantChainConfig, MerchantConfig } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';
import { countries } from '../../../data/countries';
import { getCurrencyDataFromCountries } from '../../../utils/token-helpers';

const tokenService = new TokenService();
const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

export const useRegistrationForm = () => {
  const { config, saveConfig, isLoaded } = useMerchantConfig();

  const [fiatCurrency, setFiatCurrency] = useState(config?.fiatCurrency || 'USD');
  const [chains, setChains] = useState<MerchantChainConfig[]>(config?.chains || []);

  const [addressValidity, setAddressValidity] = useState<Record<string, boolean | null>>(() => {
    const initialValidity: Record<string, boolean | null> = {};
    if (config?.chains) {
      config.chains.forEach(chain => {
        initialValidity[chain.name] = isValidAddress(chain.address);
      });
    }
    return initialValidity;
  });

  const { address: accountAddress, chain: accountChain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const currenciesData = useMemo(() => getCurrencyDataFromCountries(countries), []);

  const { data: supportedChainsData, isLoading: isLoadingSupportedChains } = useQuery({
    queryKey: ['supportedChains'],
    queryFn: () => tokenService.getSupportedChains(),
  });

  const supportedChains = useMemo(() => {
    if (!supportedChainsData) return [];
    let chainIds: number[] = [];
    chainIds = supportedChainsData;
    return blockchainData.filter(chain => chain.isEVM && chain.chainId && chainIds.includes(chain.chainId));
  }, [supportedChainsData]);

  const debouncedState = useDebounce({ fiatCurrency, chains }, 500);

  useEffect(() => {
    if (isLoaded) {
      saveConfig(debouncedState as MerchantConfig);
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
      if (chainInfo && chainInfo.isEVM) {
        const currentChainConfig = chains.find(c => c.name === chainInfo.name);
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
      if (chainInfo.isEVM && accountAddress) {
        handleAddressChange(chainInfo.name, accountAddress);
      } else if (!chainInfo.isEVM) {
        console.warn(`Cannot use EVM wallet for non-EVM chain: ${chainInfo.name}`);
      }
    }
  }, [isConnected, connect, connectors, accountAddress, handleAddressChange]);

  const handleChainChange = (chainName: string, isChecked: boolean) => {
    setChains(prev => {
      if (isChecked) {
        if (prev.some(c => c.name === chainName)) {
          return prev;
        }
        return [...prev, { name: chainName, address: '', tokens: [], chainId: blockchainData.find(b => b.name === chainName)?.chainId || 0 }];
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
    supportedChains: supportedChains.length > 0 ? supportedChains : blockchainData.filter(c => c.isEVM),
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

