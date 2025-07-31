import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TokenService } from '../services/token-service';
import { type TokenInfo } from '../data/tokens'; // Keep for structure reference if needed, but not direct data source
import { blockchainData } from '../data/blockchains';
import blocklessLogo from '../assets/blockless.svg'; // Fallback logo
import { 
  injectAndCategorizeTokens, 
  getTokenLogoURI, 
  getRiskInfo,
  TOKEN_CATEGORIES,
  getCategory
} from '../utils/token-helpers'; // Import updated helpers
import type { TokenInfoDto } from '../services/types'; // Import TokenInfoDto

const tokenService = new TokenService();

interface SelectTokenProps {
  onSelect: (token: TokenInfo) => void;
  onBack: () => void;
  selectedToken: TokenInfo | null;
  selectedChain: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  destinationAddress: string;
  onGenerateQRs: () => void;
}

export const SelectToken = ({ 
  onSelect, 
  onBack, 
  selectedToken, 
  selectedChain, 
  amount, 
  onAmountChange, 
  destinationAddress, 
  onGenerateQRs 
}: SelectTokenProps) => {
  const chain = blockchainData.find(c => c.name === selectedChain);
  const chainId = chain?.chainId;

  // State to handle image loading errors for token logos
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const handleImageError = (symbol: string) => {
    setImgErrorMap(prev => ({ ...prev, [symbol]: true }));
  };

  const { data: whitelistedTokensData, isLoading, error } = useQuery({
    queryKey: ['whitelistedTokens', chainId],
    queryFn: () => tokenService.getWhitelistedTokensList(chainId!).then(res => res.tokens),
    enabled: !!chainId, // Only enable query if chainId is available
  });

  const processedTokens = useMemo(() => {
    if (!whitelistedTokensData || !chain) return [];

    // Use the helper to inject native/stablecoins and categorize
    const allProcessed = injectAndCategorizeTokens(whitelistedTokensData, chain.chainId!, chain.name);

    // Filter to only show selectable tokens (Native and Stablecoins) and discard malicious/unverified/suspicious
    return allProcessed.filter(token => {
      const category = TOKEN_CATEGORIES[getCategory(token) as keyof typeof TOKEN_CATEGORIES];
      const riskInfo = getRiskInfo(token.tags || []);
      
      // Only allow stablecoins and major assets for selection
      const isAllowedCategory = category === TOKEN_CATEGORIES.STABLECOINS || category === TOKEN_CATEGORIES.MAJOR_ASSETS;
      
      // Discard malicious (level 4), suspicious (level 3), and unverified (level 2) tokens.
      // Keep Verified (0) and Availability Risk (1).
      const isAcceptedRiskLevel = riskInfo.level < 2; 
      
      return isAllowedCategory && isAcceptedRiskLevel;
    });
  }, [whitelistedTokensData, chain]);

  const handleSelectToken = (token: TokenInfoDto) => {
    // Map TokenInfoDto to the simpler TokenInfo expected by the parent hook
    onSelect({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      decimals: token.decimals,
      chainId: token.chainId,
    });
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (selectedToken && amount && parseFloat(amount) > 0) {
            onGenerateQRs();
        }
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Token</h2>
      
      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 dark:text-primary-300 mb-2">
          Amount to Pay
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border border-gray-300 dark:border-primary-800 rounded-lg bg-white dark:bg-primary-800 text-xl font-semibold text-gray-900 dark:text-white placeholder:text-gray-400"
          placeholder="0.0"
          step="any"
        />
        {parseFloat(amount) <= 0 && amount.length > 0 && (
          <p className="mt-2 text-sm text-red-500">Amount must be greater than zero.</p>
        )}
      </div>
      
      {/* Token Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 dark:text-primary-300 mb-2">
          Select Token to Pay With
        </label>
        {isLoading && <p className="text-gray-500 dark:text-primary-400">Loading tokens...</p>}
        {error && <p className="text-red-500 dark:text-red-400">Error loading tokens.</p>}
        {!isLoading && !error && processedTokens.length === 0 && (
          <p className="text-gray-500 dark:text-primary-400">No supported tokens found for this chain.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
          {processedTokens
            .map((token) => (
              <div
                key={token.address === 'native' ? `${token.symbol}-${token.chainId}-native` : token.address} // Robust key
                onClick={() => handleSelectToken(token)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center ${
                  selectedToken?.symbol === token.symbol
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <img 
                  src={imgErrorMap[token.symbol] ? blocklessLogo : (token.logoURI || getTokenLogoURI(token.address, token.symbol, selectedChain))} 
                  alt={token.name} 
                  className="h-8 w-8 rounded-full object-contain mr-3 flex-shrink-0" 
                  onError={() => handleImageError(token.symbol)}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-primary-200">{token.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-primary-400 truncate">{token.name}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Target Address (if provided) */}
      {destinationAddress && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 dark:text-primary-300 mb-2">
            Recipient Address
          </label>
          <div className="p-3 bg-gray-100 dark:bg-primary-800 rounded-lg">
            <div className="text-sm break-all text-gray-900 dark:text-white font-mono">
              {destinationAddress}
            </div>
          </div>
        </div>
      )}
      
      {/* Action Button */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-800 dark:text-primary-300 hover:bg-gray-100 dark:hover:bg-primary-800 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          onClick={onGenerateQRs}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedToken || !amount || parseFloat(amount) <= 0}
        >
          Generate QR Codes
        </button>
      </div>
    </div>
  );
};
