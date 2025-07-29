import { useQuery } from '@tanstack/react-query';
import { TokenService } from '../../../services/token-service';
import { defaultTheme } from '../../../data/blockchains';
import type { UseRegistrationFormReturn } from '../hooks/useRegistrationForm';
import type { MerchantChainConfig } from '../../../types';

const tokenService = new TokenService();

interface ChainConfigCardProps {
  chainInfo: (typeof import('../../../data/blockchains').blockchainData)[0];
  currentChainConfig: MerchantChainConfig | undefined;
  addressValidity: boolean | null;
  onChainChange: (chainName: string, isChecked: boolean) => void;
  onAddressChange: (chainName: string, address: string) => void;
  onTokenChange: (chainName: string, tokenSymbol: string, isChecked: boolean) => void;
  onUseWallet: (chainInfo: (typeof import('../../../data/blockchains').blockchainData)[0]) => void;
  wallet: UseRegistrationFormReturn['wallet'];
}

const TokenSelector = ({ chainId, chainName, selectedTokens, onTokenChange, theme }: {
    chainId: number,
    chainName: string,
    selectedTokens: string[],
    onTokenChange: (chainName: string, tokenSymbol: string, isChecked: boolean) => void,
    theme: typeof defaultTheme,
}) => {
    const { data: tokenList, isLoading, error } = useQuery({
        queryKey: ['tokens', chainId],
        queryFn: () => tokenService.getWhitelistedTokensList(chainId),
        enabled: !!chainId,
    });

    if (isLoading) return <div className={`text-sm ${theme.label}`}>Loading tokens...</div>;
    if (error) return <div className="text-sm text-red-500">Failed to load tokens.</div>;

    const availableTokens = tokenList?.tokens || [];
    
    return (
        <div>
            <label className={`block text-sm font-medium mb-2 ${theme.label}`}>
                Accepted Tokens on {chainName}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableTokens.map(token => (
                    <div key={token.symbol} className="flex items-center">
                        <input
                            type="checkbox"
                            id={`token-${chainId}-${token.symbol}`}
                            checked={selectedTokens.includes(token.symbol)}
                            onChange={e => onTokenChange(chainName, token.symbol, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`token-${chainId}-${token.symbol}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {token.symbol}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const ChainConfigCard = ({
  chainInfo,
  currentChainConfig,
  addressValidity,
  onChainChange,
  onAddressChange,
  onTokenChange,
  onUseWallet,
  wallet
}: ChainConfigCardProps) => {
  const theme = chainInfo.theme || defaultTheme;
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className={`p-4 border rounded-lg transition-all ${theme.bg} ${theme.border}`}>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id={`chain-${chainInfo.id}`}
          checked={!!currentChainConfig}
          onChange={e => onChainChange(chainInfo.name, e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={`chain-${chainInfo.id}`} className={`ml-3 text-lg font-medium ${theme.text}`}>
          {chainInfo.name}
        </label>
      </div>

      {currentChainConfig && (
        <div className="space-y-4 pl-8">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme.label}`}>
              Your {chainInfo.name} Wallet Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={currentChainConfig.address}
                onChange={e => onAddressChange(chainInfo.name, e.target.value)}
                placeholder="0x..."
                className={`w-full p-2 pr-24 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${addressValidity === false ? 'border-red-500' : theme.border}`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                  {addressValidity === true && <span className="text-green-500">✓</span>}
                  <button onClick={() => handleCopy(currentChainConfig?.address || '')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                  <button onClick={() => onAddressChange(chainInfo.name, '')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
            </div>
             <button onClick={() => onUseWallet(chainInfo)} className={`mt-2 px-3 py-1 text-xs rounded-md ${theme.secondaryButton}`}>
                {wallet.isConnected && wallet.chain?.id === chainInfo.chainId ? 'Use My Address' : (wallet.isConnected ? `Switch to ${chainInfo.name}` : 'Connect Wallet')}
            </button>
          </div>
          {chainInfo.chainId &&
            <TokenSelector
                chainId={chainInfo.chainId}
                chainName={chainInfo.name}
                selectedTokens={currentChainConfig.tokens}
                onTokenChange={onTokenChange}
                theme={theme}
            />
          }
        </div>
      )}
    </div>
  );
};
