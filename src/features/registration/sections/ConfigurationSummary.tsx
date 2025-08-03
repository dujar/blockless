import type { MerchantChainConfig } from '../../../types';
import { blockchainData, defaultTheme } from '../../../data/blockchains';

interface ConfigurationSummaryProps {
  chains: MerchantChainConfig[];
  fiatCurrency: string;
}

export const ConfigurationSummary = ({ chains, fiatCurrency }: ConfigurationSummaryProps) => {
  if (chains.length === 0) {
    return (
      <div className="sticky top-24 p-6 bg-base-100 rounded-2xl shadow-inner shadow-dynamic text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Configuration Summary</h3>
        <p className="text-sm text-neutral-content">Your selections will appear here.</p>
      </div>
    );
  }

  return (
    <div className="sticky top-24 p-6 bg-base-100 rounded-2xl shadow-lg shadow-dynamic">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Current Configuration</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Fiat Currency</label>
          <p className="text-lg font-semibold text-base-content">{fiatCurrency}</p>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Accepted Payments</label>
          {chains.map(chain => {
            const theme = blockchainData.find(b => b.name === chain.name)?.theme || defaultTheme;
            return (
              <div key={chain.name} className={`p-4 rounded-lg ${theme.bg} border ${theme.border}`}>
                <h4 className={`font-semibold mb-2 text-gray-900 dark:text-gray-100`}>{chain.name}</h4>
                <div className="text-xs font-mono break-all text-neutral-content mb-2">{chain.address}</div>
                <div className="flex flex-wrap gap-2">
                  {chain.tokens.map(token => (
                    <span key={token} className={`px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-base-content`}>
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
