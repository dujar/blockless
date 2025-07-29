import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConnect, useSwitchChain, useDisconnect } from 'wagmi';
import { useMerchantConfig } from '../../../hooks/useMerchantConfig';
import { blockchainData } from '../../../data/blockchains';
import { TokenService } from '../../../services/token-service';
import type { MerchantChainConfig } from '../../../types';

const tokenService = new TokenService();
const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);
const FIAT_CURRENCIES = ['USD', 'EUR', 'SGD', 'JPY', 'GBP'];

export const useRegistrationForm = () => {
  const { config, saveConfig, isLoaded } = useMerchantConfig();
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [chains, setChains] = useState<MerchantChainConfig[]>([]);
  const [addressValidity, setAddressValidity] = useState<Record<string, boolean | null>>({});
  const [isSaved, setIsSaved] = useState(false);

  const { address: accountAddress, chain: accountChain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  
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
    } else if (Array.isArray(supportedChainsData)) { // Or just an array of numbers
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
        const isChainEnabled = chains.some(c => c.name === chainInfo.name);
        if (isChainEnabled) {
          handleAddressChange(chainInfo.name, accountAddress);
        }
      }
    }
  }, [isConnected, accountAddress, accountChain, chains, handleAddressChange]);

  const handleUseWallet = useCallback((chainInfo: (typeof blockchainData)[0]) => {
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
            ? [...c.tokens, tokenSymbol]
            : c.tokens.filter(t => t !== tokenSymbol);
          return { ...c, tokens: newTokens };
        }
        return c;
      })
    );
  };

  const handleSave = () => {
    const isValid = chains.every(c => addressValidity[c.name] && c.tokens.length > 0);
    if (!isValid) {
      alert('Please ensure all selected chains have a valid address and at least one token selected.');
      return;
    }
    saveConfig({ fiatCurrency, chains });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };
  
  return {
    isLoaded: isLoaded && !isLoadingSupportedChains,
    fiatCurrency,
    setFiatCurrency,
    chains,
    addressValidity,
    isSaved,
    handleAddressChange,
    handleChainChange,
    handleTokenChange,
    handleSave,
    FIAT_CURRENCIES,
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
