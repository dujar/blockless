import { useQuery } from '@tanstack/react-query';
import { TokenService } from '../../../services/token-service';
import { defaultTheme, type BlockchainData } from '../../../data/blockchains';
import type { UseRegistrationFormReturn } from '../hooks/useRegistrationForm';
import type { MerchantChainConfig } from '../../../types';
import { useState, useMemo } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import type { TokenDto, TokenInfoDto } from '../../../services/types';
// Import from new token-helpers utility file
import { 
  getRiskInfo, 
  getCategory, 
  getTokenLogoURI, 
  TOKEN_CATEGORIES,
  injectAndCategorizeTokens 
} from '../../../utils/token-helpers'; 
import blocklessLogo from '../../../assets/blockless.svg'; 
import nativeTokens from '../../../data/native-tokens.json'; 


const tokenService = new TokenService();

interface ChainConfigCardProps {
  chainInfo: (typeof import('../../../data/blockchains').blockchainData)[0];
  currentChainConfig: MerchantChainConfig;
  addressValidity: boolean | null;
  onChainChange: (chainName: string, isChecked: boolean) => void;
  onAddressChange: (chainName: string, address: string) => void;
  onTokenChange: (chainName: string, tokenSymbol: string, isChecked: boolean) => void;
  onUseWallet: (chainInfo: (typeof import('../../../data/blockchains').blockchainData)[0]) => void;
  wallet: UseRegistrationFormReturn['wallet'];
}

type CategorizedTokens = {
    [category: string]: TokenInfoDto[];
};

/**
 * Retrieves the logo for a blockchain, primarily from native-tokens.json mapping.
 * @param chain The blockchain data.
 * @returns The URL of the blockchain logo, or undefined if not found.
 */
const getBlockchainLogo = (chain: BlockchainData): string | undefined => {
    // Map internal chain IDs to what's used in native-tokens.json if different
    const idMap: { [key: string]: string } = {
        'bnb': 'binancecoin', // 'bnb' in blockchainData maps to 'binancecoin' in native-tokens.json
        'polygon': 'polygon', // 'polygon' is consistent
        'ethereum': 'ethereum', // 'ethereum' is consistent
        'avalanche': 'avalanche', // 'avalanche' is consistent
        'arbitrum': 'arbitrum', // 'arbitrum' is consistent
        'optimism': 'optimism', // 'optimism' is consistent
        'base': 'base', // 'base' is consistent
        'linea': 'linea', // 'linea' is consistent
    };
    const lookupId = idMap[chain.id] || chain.id; // Use mapped ID or original

    const tokenInfo = (nativeTokens as any[]).find(token => token.blockchain === lookupId);
    return tokenInfo?.logo;
};

const TokenItem = ({ token, chainName, isChecked, onTokenChange, isSelectable }: {
    token: TokenInfoDto;
    chainName: string;
    isChecked: boolean;
    onTokenChange: (chainName: string, tokenSymbol: string, isChecked: boolean) => void;
    isSelectable: boolean; // New prop to control selection
}) => {
    const riskInfo = getRiskInfo(token.tags || []);
    const tooltipText = `Name: ${token.name}\nAddress: ${token.address}\nRisk: ${riskInfo.label} - ${riskInfo.description}`;

    // Determine initial image source, preferring API logo, then enhanced helper, then blockless fallback
    const initialImgSrc = token.logoURI || getTokenLogoURI(token.address, token.symbol, chainName);
    const [imgSrc, setImgSrc] = useState(initialImgSrc);

    // Fallback if the image fails to load
    const handleError = () => {
        if (imgSrc !== blocklessLogo) { // Prevent infinite loop if blocklessLogo itself fails
            setImgSrc(blocklessLogo);
        }
    };

    return (
        <div 
            className={`flex items-center p-2 rounded ${isSelectable ? 'hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer' : 'opacity-70 cursor-not-allowed'}`} 
            title={tooltipText}
            onClick={() => isSelectable && onTokenChange(chainName, token.symbol, !isChecked)} // Toggle only if selectable
        >
            <input
                type="checkbox"
                id={`token-${token.chainId}-${token.symbol}-${token.address}`}
                checked={isChecked}
                onChange={e => onTokenChange(chainName, token.symbol, e.target.checked)}
                disabled={!isSelectable && !isChecked} // Disable if not selectable AND not already checked
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-primary-600 focus:ring-primary-500 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor={`token-${token.chainId}-${token.symbol}-${token.address}`} className="ml-3 flex items-center cursor-pointer flex-1 min-w-0">
                <img 
                    src={imgSrc} 
                    alt={token.name} 
                    className="h-6 w-6 mr-2 rounded-full flex-shrink-0" 
                    onError={handleError} 
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{token.symbol}</span>
                {riskInfo.level > 1 && <span className={`ml-2 text-xs font-semibold ${riskInfo.color}`}>({riskInfo.label})</span>}
            </label>
        </div>
    );
}

const SelectedTokenChip = ({ token, chainName, onTokenRemove}: {
    token: TokenInfoDto;
    chainName: string;
    onTokenRemove: (chainName: string, tokenSymbol: string, isChecked: boolean) => void;
    theme: typeof defaultTheme; // Theme from blockchainData, not global merchant theme
}) => {
    // Determine initial image source, preferring API logo, then enhanced helper, then blockless fallback
    const initialImgSrc = token.logoURI || getTokenLogoURI(token.address, token.symbol, chainName);
    const [imgSrc, setImgSrc] = useState(initialImgSrc);

    const handleError = () => {
        if (imgSrc !== blocklessLogo) {
            setImgSrc(blocklessLogo);
        }
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200`}>
            <img 
                src={imgSrc} 
                alt={token.name} 
                className="h-5 w-5 mr-2 rounded-full flex-shrink-0" 
                onError={handleError} 
            />
            {token.symbol}
            <button
                type="button"
                className="ml-2 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => onTokenRemove(chainName, token.symbol, false)}
            >
                <span className="sr-only">Remove {token.symbol}</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
            </button>
        </span>
    );
}

const TokenSelector = ({ chainId, chainName, selectedTokens, onTokenChange, theme }: {
    chainId: number,
    chainName: string,
    selectedTokens: string[],
    onTokenChange: (chainName: string, tokenSymbol: string, isChecked: boolean) => void,
    theme: typeof defaultTheme, // Theme from blockchainData, not global merchant theme
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    // Debounce search term only for API calls, not for immediate UI filtering
    const debouncedSearchTerm = useDebounce(searchTerm, searchTerm.length >= 3 ? 300 : 2000);

    const { data: tokenList, isLoading, error } = useQuery({
        queryKey: ['tokens', chainId],
        queryFn: () => tokenService.getWhitelistedTokensList(chainId),
        enabled: !!chainId,
    });

    const { data: searchedTokensData, isLoading: isSearching } = useQuery({
        queryKey: ['searchTokens', chainId, debouncedSearchTerm],
        queryFn: () => tokenService.searchForTokens(chainId, { query: debouncedSearchTerm }),
        // Only enable search query if there's a debounced term and search is focused
        enabled: !!chainId && debouncedSearchTerm.length > 0 && isSearchFocused,
    });

    const allProcessedTokens = useMemo((): TokenInfoDto[] => {
        let fetchedTokens: TokenInfoDto[] = [];

        if (isSearchFocused && debouncedSearchTerm) {
            // If searching, use search results from API
            fetchedTokens = (searchedTokensData || []).map((token: TokenDto): TokenInfoDto => ({
                ...token,
                logoURI: token.logoURI || getTokenLogoURI(token.address, token.symbol, chainName),
                tags: token.tags?.map(t => t.value) || [],
                extensions: (token as any).extensions || {},
            }));
        } else {
            // If not searching, use the full whitelisted list
            fetchedTokens = (tokenList?.tokens || []).map((token: TokenInfoDto): TokenInfoDto => ({
                ...token,
                logoURI: token.logoURI || getTokenLogoURI(token.address, token.symbol, chainName), // Ensure logoURI fallback
                tags: token.tags || [], 
                extensions: token.extensions || {},
            }));
        }

        // Use the new helper function for injection and categorization
        return injectAndCategorizeTokens(fetchedTokens, chainId, chainName);
    }, [isSearchFocused, debouncedSearchTerm, searchedTokensData, tokenList, chainId, chainName]);

    // Filter to only show selectable tokens (Native and Stablecoins) and discard malicious/unverified
    const tokensToDisplay = useMemo(() => {
        return allProcessedTokens.filter(token => {
            const category = getCategory(token);
            const riskInfo = getRiskInfo(token.tags || []);
            
            // Only allow stablecoins and major assets (which includes native tokens) for selection
            const isAllowedCategory = category === TOKEN_CATEGORIES.STABLECOINS.label || category === TOKEN_CATEGORIES.MAJOR_ASSETS.label;
            
            // Discard malicious (level 4), suspicious (level 3), and unverified (level 2) tokens
            // Tokens with level 0 (Verified) or 1 (Availability Risk) are considered acceptable.
            // const isNotDiscardedRisk = riskInfo.level < TOKEN_CATEGORIES.WARNING.order; // TOKEN_CATEGORIES.WARNING.order is 3, so levels 0, 1, 2 are kept. Changed based on instruction to filter out 'unverified' which is level 2.
            // Re-evaluating based on the instruction "malicious or unverified tokens should be discarded"
            // getRiskInfo levels: 4-Malicious, 3-Suspicious, 2-Unverified, 1-Availability Risk, 0-Verified
            // So, discard levels 2, 3, 4. Keep levels 0, 1. Thus `riskInfo.level < 2`.
            const isAcceptedRiskLevel = riskInfo.level < 2; // This will keep Verified (0) and Availability Risk (1)
            
            return isAllowedCategory && isAcceptedRiskLevel;
        });
    }, [allProcessedTokens]);


    const categorizedTokens = useMemo(() => {
        const categories: CategorizedTokens = {};
        for (const token of tokensToDisplay) {
            const categoryLabel = getCategory(token); 
            if (!categories[categoryLabel]) {
                categories[categoryLabel] = [];
            }
            categories[categoryLabel].push(token);
        }
        return categories;
    }, [tokensToDisplay]);
    
    const sortedCategories = useMemo(() => {
        // Only show categories that are allowed for selection and sorting
        const allowedCategories = [TOKEN_CATEGORIES.STABLECOINS.label, TOKEN_CATEGORIES.MAJOR_ASSETS.label];
        return Object.keys(categorizedTokens)
            .filter(category => allowedCategories.includes(category))
            .sort((a, b) => {
                const orderA = Object.values(TOKEN_CATEGORIES).find(c => c.label === a)?.order ?? 99;
                const orderB = Object.values(TOKEN_CATEGORIES).find(c => c.label === b)?.order ?? 99;
                return orderA - orderB;
            });
    }, [categorizedTokens]);

    // Derive full token info for selected tokens to display chips
    const selectedTokenDetails = useMemo(() => {
        if (selectedTokens.length === 0 || allProcessedTokens.length === 0) return [];
        // Filter from allProcessedTokens, not just tokensToDisplay, so previously selected non-supported tokens still show their chip
        return allProcessedTokens
            .filter(t => selectedTokens.includes(t.symbol)); 
    }, [selectedTokens, allProcessedTokens]);
    
    return (
        <div>
            <label className={`block text-sm font-medium mb-2 ${theme.label}`}>
                Accepted Tokens on {chainName}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Only native blockchain tokens and common stablecoins are currently supported for selection.
            </p>

            {selectedTokenDetails.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                    {selectedTokenDetails.map(token => (
                        <SelectedTokenChip 
                            // Use a more robust key to prevent issues with duplicate symbols across different token types (e.g., native ETH vs. ERC20 ETH)
                            key={token.address === 'native' ? `${token.symbol}-${token.chainId}-native-selected` : `${token.address}-selected`}
                            token={token} 
                            chainName={chainName} 
                            onTokenRemove={onTokenChange} 
                            theme={theme} 
                        />
                    ))}
                </div>
            )}

            <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    placeholder="Search for a token..."
                    className={`w-full p-2 pl-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${theme.border}`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => { if (!searchTerm) setIsSearchFocused(false); }}
                />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {(isLoading || isSearching) && <div className={`text-sm ${theme.label}`}>Loading tokens...</div>}
                {error && <div className="text-sm text-red-500">Failed to load tokens.</div>}
                
                {sortedCategories.map(category => (
                    <div key={category}>
                        <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 px-2 py-1">
                            {category} ({categorizedTokens[category].length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2">
                            {categorizedTokens[category].map(token => (
                                <TokenItem
                                    // Use a robust key for list items, considering 'native' tokens might have same symbol as wrapped
                                    key={token.address === 'native' ? `${token.symbol}-${token.chainId}-native-item` : `${token.address}-item`}
                                    token={token}
                                    chainName={chainName}
                                    isChecked={selectedTokens.includes(token.symbol)}
                                    onTokenChange={onTokenChange}
                                    isSelectable={true} // All tokens in tokensToDisplay are selectable
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {tokensToDisplay.length === 0 && !isLoading && !isSearching && !error && (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                        No native or stable tokens found matching your search.
                    </div>
                )}
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
  const chainLogo = getBlockchainLogo(chainInfo);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const getWalletButtonText = () => {
    if (!wallet.isConnected) {
      return 'Connect Wallet';
    }
    if (!chainInfo.isEVM) {
        return 'EVM Wallet Only (for now)';
    }
    if (wallet.address && currentChainConfig.address.toLowerCase() === wallet.address.toLowerCase()) {
      return 'Wallet Address Set';
    }
    return 'Use My Connected Address';
  };

  return (
    <div className={`p-4 border rounded-lg transition-all ${theme.bg} ${theme.border} shadow-dynamic`}>
      <div className="flex items-center justify-between mb-4">
        <label className={`flex items-center text-lg font-medium ${theme.text}`}>
            {chainLogo ? (
                <img src={chainLogo} alt={chainInfo.name} className="w-8 h-8 mr-3 rounded-full object-contain" />
            ) : (
                <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 font-bold">
                    {chainInfo.name.charAt(0)}
                </span>
            )}
          {chainInfo.name}
        </label>
        <button
            onClick={() => onChainChange(chainInfo.name, false)}
            className="text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
            Remove
        </button>
      </div>

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
             <button
                onClick={() => onUseWallet(chainInfo)}
                className={`mt-2 px-3 py-1 text-xs rounded-md 
                bg-primary-500 hover:bg-primary-600 text-white 
                ${(!wallet.isConnected || !chainInfo.isEVM) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!wallet.isConnected || !chainInfo.isEVM}
            >
                {getWalletButtonText()}
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
    </div>
  );
};
