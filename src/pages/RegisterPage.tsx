import { useState, useEffect } from 'react';
import { useMerchantConfig } from '../hooks/useMerchantConfig';
import { blockchainData } from '../data/blockchains';
import { tokenData } from '../data/tokens';
import type { MerchantChainConfig } from '../types';

const FIAT_CURRENCIES = ['USD', 'EUR', 'SGD', 'JPY', 'GBP'];

const RegisterPage = () => {
  const { config, saveConfig, isLoaded } = useMerchantConfig();
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [chains, setChains] = useState<MerchantChainConfig[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isLoaded && config) {
      setFiatCurrency(config.fiatCurrency);
      setChains(config.chains);
    }
  }, [isLoaded, config]);

  const handleChainChange = (chainName: string, isChecked: boolean) => {
    if (isChecked) {
      const chainInfo = blockchainData.find(c => c.name === chainName);
      if (chainInfo) {
        setChains(prev => [...prev, { name: chainName, address: '', tokens: [] }]);
      }
    } else {
      setChains(prev => prev.filter(c => c.name !== chainName));
    }
  };

  const handleAddressChange = (chainName: string, address: string) => {
    setChains(prev => prev.map(c => (c.name === chainName ? { ...c, address } : c)));
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
    const isValid = chains.every(c => /^0x[a-fA-F0-9]{40}$/.test(c.address) && c.tokens.length > 0);
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Merchant Registration</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Configure your payment preferences. This is saved in your browser.
      </p>

      <div className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        {/* Fiat Currency */}
        <div>
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
        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Configure Blockchains & Wallets</h2>
          <div className="space-y-6">
            {blockchainData.filter(c => c.isEVM).map(chain => {
              const currentChainConfig = chains.find(c => c.name === chain.name);
              const availableTokens = tokenData.filter(t => t.chainId === chain.chainId);

              return (
                <div key={chain.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id={`chain-${chain.id}`}
                      checked={!!currentChainConfig}
                      onChange={e => handleChainChange(chain.name, e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`chain-${chain.id}`} className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                      {chain.name}
                    </label>
                  </div>

                  {currentChainConfig && (
                    <div className="space-y-4 pl-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Your {chain.name} Wallet Address
                        </label>
                        <input
                          type="text"
                          value={currentChainConfig.address}
                          onChange={e => handleAddressChange(chain.name, e.target.value)}
                          placeholder="0x..."
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
        <div className="flex justify-end items-center pt-4">
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
    </div>
  );
};

export default RegisterPage;
