import { useState, useEffect, useCallback } from 'react';
import { useMerchantConfig } from '../hooks/useMerchantConfig';
import { blockchainData, defaultTheme } from '../data/blockchains';
import { tokenData } from '../data/tokens';
import type { MerchantChainConfig } from '../types';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';

const FIAT_CURRENCIES = ['USD', 'EUR', 'SGD', 'JPY', 'GBP'];

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const ConfigurationReport = ({ chains, fiatCurrency }: { chains: MerchantChainConfig[]; fiatCurrency: string }) => {
  if (chains.length === 0) {
    return (
      <div className="sticky top-24 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl shadow-inner text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Configuration Summary</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Your selections will appear here.</p>
      </div>
    );
  }

  return (
    <div className="sticky top-24 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Configuration</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fiat Currency</label>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{fiatCurrency}</p>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Accepted Payments</label>
          {chains.map(chain => {
            const theme = blockchainData.find(b => b.name === chain.name)?.theme || defaultTheme;
            return (
              <div key={chain.name} className={`p-4 rounded-lg ${theme.bg} border ${theme.border}`}>
                <h4 className={`font-semibold mb-2 ${theme.text}`}>{chain.name}</h4>
                <div className="text-xs font-mono break-all text-gray-700 dark:text-gray-300 mb-2">{chain.address}</div>
                <div className="flex flex-wrap gap-2">
                  {chain.tokens.map(token => (
                    <span key={token} className={`px-2 py-1 text-xs font-medium rounded-full ${theme.secondaryButton}`}>
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { config, saveConfig, isLoaded } = useMerchantConfig();
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [chains, setChains] = useState<MerchantChainConfig[]>([]);
  const [addressValidity, setAddressValidity] = useState<Record<string, boolean | null>>({});
  const [isSaved, setIsSaved] = useState(false);

  const { address: accountAddress, chain: accountChain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

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
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
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

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Merchant Registration</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Configure your payment preferences. This is saved in your browser.
      </p>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Fiat Currency */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Select Fiat Currency</h2>
            <select
              value={fiatCurrency}
              onChange={e => setFiatCurrency(e.target.value)}
              className="w-full max-w-xs p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {FIAT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Blockchain & Token Selection */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Configure Blockchains & Wallets</h2>
            {isConnected && (
              <div className="mb-4 flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Connected: {accountAddress?.slice(0, 6)}...{accountAddress?.slice(-4)} on {accountChain?.name}
                  </p>
                  <button onClick={() => disconnect()} className="text-sm text-red-500 hover:underline">Disconnect</button>
              </div>
            )}
            <div className="space-y-6">
              {blockchainData.filter(c => c.isEVM).map(chain => {
                const currentChainConfig = chains.find(c => c.name === chain.name);
                const availableTokens = tokenData.filter(t => t.chainId === chain.chainId);
                const theme = chain.theme || defaultTheme;

                return (
                  <div key={chain.id} className={`p-4 border rounded-lg transition-all ${theme.bg} ${theme.border}`}>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id={`chain-${chain.id}`}
                        checked={!!currentChainConfig}
                        onChange={e => handleChainChange(chain.name, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`chain-${chain.id}`} className={`ml-3 text-lg font-medium ${theme.text}`}>
                        {chain.name}
                      </label>
                    </div>

                    {currentChainConfig && (
                      <div className="space-y-4 pl-8">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme.label}`}>
                            Your {chain.name} Wallet Address
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={currentChainConfig.address}
                              onChange={e => handleAddressChange(chain.name, e.target.value)}
                              placeholder="0x..."
                              className={`w-full p-2 pr-24 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${addressValidity[chain.name] === false ? 'border-red-500' : theme.border}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                                {addressValidity[chain.name] === true && <span className="text-green-500">✓</span>}
                                <button onClick={() => handleCopy(currentChainConfig.address)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                <button onClick={() => handleAddressChange(chain.name, '')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                          </div>
                           <button onClick={() => handleUseWallet(chain)} className={`mt-2 px-3 py-1 text-xs rounded-md ${theme.secondaryButton}`}>
                              {isConnected && accountChain?.id === chain.chainId ? 'Use My Address' : (isConnected ? `Switch to ${chain.name}` : 'Connect Wallet')}
                          </button>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${theme.label}`}>
                            Accepted Tokens on {chain.name}
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {availableTokens.map(token => (
                              <div key={token.symbol} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`token-${chain.id}-${token.symbol}`}
                                  checked={currentChainConfig.tokens.includes(token.symbol)}
                                  onChange={e => handleTokenChange(chain.name, token.symbol, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`token-${chain.id}-${token.symbol}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                  {token.symbol}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end items-center">
              {isSaved && (
                  <span className="text-green-600 dark:text-green-400 mr-4">Configuration Saved!</span>
              )}
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition shadow-lg hover:shadow-xl"
            >
              Save Configuration
            </button>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ConfigurationReport chains={chains} fiatCurrency={fiatCurrency} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
