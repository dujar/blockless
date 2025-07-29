import { useQuery } from '@tanstack/react-query';
import { TokenService } from '../../../services/token-service';
import { defaultTheme, blockchainData } from '../../../data/blockchains';
import type { UseRegistrationFormReturn } from '../hooks/useRegistrationForm';
import type { MerchantChainConfig } from '../../../types';
import { useState, useMemo } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import type { TokenDto, TokenInfoDto } from '../../../services/types';
import blocklessLogo from '../../../assets/blockless.svg'; // Using for fallback/generic logos

// Import specific token logos (assuming these exist in src/assets)
import ethLogo from '../../../assets/eth.svg';
import bnbLogo from '../../../assets/bnb.svg';
import maticLogo from '../../../assets/matic.svg';
import avaxLogo from '../../../assets/avax.svg';
import usdcLogo from '../../../assets/usdc.svg';
import daiLogo from '../../../assets/dai.svg';
import usdtLogo from '../../../assets/usdt.svg';


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

const TOKEN_CATEGORIES = {
  STABLECOINS: { order: 0, label: 'Stablecoins & Major Assets' },
  VERIFIED: { order: 1, label: 'Verified Tokens' },
  WARNING: { order: 2, label: 'Tokens with Warnings' },
  HIGH_RISK: { order: 3, label: 'High-Risk Tokens' },
};

const getRiskInfo = (tags: string[] = []) => {
    if (tags.includes('RISK:malicious')) return { level: 4, label: 'Malicious', description: 'This token is flagged as malicious. Interacting with it is extremely risky.', color: 'text-red-600 dark:text-red-500' };
    if (tags.includes('RISK:suspicious')) return { level: 3, label: 'Suspicious', description: 'This token is flagged as suspicious. High risk involved.', color: 'text-red-500 dark:text-red-400' };
    if (tags.includes('RISK:unverified')) return { level: 2, label: 'Unverified', description: 'This token is not verified by 1inch. Please do your own research.', color: 'text-yellow-500 dark:text-yellow-400' };
    if (tags.includes('RISK:availability')) return { level: 1, label: 'Availability Risk', description: 'This token might have low liquidity or other availability issues.', color: 'text-yellow-400 dark:text-yellow-300' };
    return { level: 0, label: 'Verified', description: 'This token appears to be safe.', color: 'text-green-500 dark:text-green-400' };
};

const getCategory = (token: TokenInfoDto) => {
    const riskLevel = getRiskInfo(token.tags).level;
    if (riskLevel >= 3) return TOKEN_CATEGORIES.HIGH_RISK.label;
    if (riskLevel >= 1) return TOKEN_CATEGORIES.WARNING.label;
    
    // Prioritize stablecoins and native tokens for display
    if (token.tags.some(t => t.startsWith('PEG:') || t === 'native')) {
        return TOKEN_CATEGORIES.STABLECOINS.label;
    }
    
    return TOKEN_CATEGORIES.VERIFIED.label;
};

// Define known native tokens and their canonical (often wrapped) addresses and decimals
// Including explicit local logo imports for better control and immediate visual feedback.
const NATIVE_TOKENS_INFO: { [chainName: string]: { symbol: string; address: string; decimals: number; logo: string; } } = {
  "Ethereum": { symbol: "ETH", address: "0xc02aaa39b223fe8d0a0e5c4f27eAD9083C756Cc2", decimals: 18, logo: ethLogo }, // WETH address
  "BNB Chain": { symbol: "BNB", address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", decimals: 18, logo: bnbLogo }, // WBNB address
  "Polygon": { symbol: "MATIC", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", decimals: 18, logo: maticLogo }, // WMatic address
  "Arbitrum": { symbol: "ETH", address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", decimals: 18, logo: ethLogo }, // WETH address on Arbitrum
  "Optimism": { symbol: "ETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: ethLogo }, // WETH address on Optimism
  "Avalanche": { symbol: "AVAX", address: "0xb31f66aa3c1e785363f0d87a628ed8fdc74d406b", decimals: 18, logo: avaxLogo }, // WAVAX address
  "Base": { symbol: "ETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: ethLogo }, // WETH address on Base
  "Linea": { symbol: "ETH", address: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f", decimals: 18, logo: ethLogo }, // WETH address on Linea
};

/**
 * Provides a logo URI for a token, preferring explicit local logos for native tokens/common stablecoins,
 * then 1inch CDN, then a generic fallback.
 */
const getTokenLogoURI = (tokenAddress: string, tokenSymbol: string, chainName: string): string => {
    // 1. Check for explicit local logos for native tokens first
    const nativeTokenInfo = NATIVE_TOKENS_INFO[chainName];
    if (nativeTokenInfo && (tokenAddress === 'native' || tokenAddress.toLowerCase() === nativeTokenInfo.address.toLowerCase())) {
        return nativeTokenInfo.logo;
    }
    
    // 2. Check for explicit local logos for common stablecoins
    const commonStablecoinInfo = COMMON_STABLECOINS_INFO.find(sc => 
        sc.symbol === tokenSymbol && (sc.address.toLowerCase() === tokenAddress.toLowerCase() || tokenAddress === 'native')
    );
    if (commonStablecoinInfo && commonStablecoinInfo.logo) {
        return commonStablecoinInfo.logo;
    }

    // 3. Use 1inch token logo CDN for standard ERC20 tokens
    if (tokenAddress && tokenAddress !== 'native') {
        return `https://tokens.1inch.io/${tokenAddress.toLowerCase()}.png`;
    }

    // 4. Fallback to generic Blockless logo
    return blocklessLogo; 
}

// Define common stablecoins and their specific addresses per chain
// Including explicit local logo imports.
const COMMON_STABLECOINS_INFO: { chainId: number; symbol: string; name: string; address: string; decimals: number; logo: string; }[] = [
  // Ethereum
  { chainId: 1, symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, logo: usdcLogo },
  { chainId: 1, symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, logo: daiLogo },
  { chainId: 1, symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logo: usdtLogo },
  // Polygon
  { chainId: 137, symbol: 'USDC', name: 'USD Coin (PoS)', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, logo: usdcLogo },
  { chainId: 137, symbol: 'USDT', name: 'Tether USD (PoS)', address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimals: 6, logo: usdtLogo },
  { chainId: 137, symbol: 'DAI', name: 'Dai Stablecoin (PoS)', address: '0x8f3Cf7ad23Cd3CaDbD9735Fd5CbCd737e3D0Cc71', decimals: 18, logo: daiLogo },
  // BNB Chain
  { chainId: 56, symbol: 'USDC', name: 'USD Coin (BSC)', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, logo: usdcLogo },
  { chainId: 56, symbol: 'USDT', name: 'Tether USD (BSC)', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, logo: usdtLogo },
  // Arbitrum
  { chainId: 42161, symbol: 'USDC', name: 'USD Coin (Arb)', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, logo: usdcLogo },
  { chainId: 42161, symbol: 'USDT', name: 'Tether USD (Arb)', address: '0xFd086bc7Cd5c485c53Ef62bc2b125E5C49aFff27', decimals: 6, logo: usdtLogo },
  // Optimism
  { chainId: 10, symbol: 'USDC', name: 'USD Coin (Op)', address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', decimals: 6, logo: usdcLogo },
  { chainId: 10, symbol: 'DAI', name: 'Dai Stablecoin (Op)', address: '0xda10009c0cb56bb0aac6dfecab8b3951b536dcba', decimals: 18, logo: daiLogo },
  // Avalanche
  { chainId: 43114, symbol: 'USDC', name: 'USD Coin (Avax)', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, logo: usdcLogo },
  { chainId: 43114, symbol: 'USDT', name: 'Tether USD (Avax)', address: '0x9702230a8ada49a406fcd6f3c550c1afa1bec1bc', decimals: 6, logo: usdtLogo },
];


const TokenItem = ({ token, chainName, isChecked, onTokenChange }: {
    token: TokenInfoDto;
    chainName: string;
    isChecked: boolean;
    onTokenChange: (chainName: string, tokenSymbol: string, isChecked: boolean) => void;
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
        <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50" title={tooltipText}>
            <input
                type="checkbox"
                id={`token-${token.chainId}-${token.symbol}-${token.address}`}
                checked={isChecked}
                onChange={e => onTokenChange(chainName, token.symbol, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-blue-600 focus:ring-blue-500 bg-transparent"
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

const SelectedTokenChip = ({ token, chainName, onTokenRemove, theme }: {
    token: TokenInfoDto;
    chainName: string;
    onTokenRemove: (chainName: string, tokenSymbol: string, isChecked: boolean) => void;
    theme: typeof defaultTheme;
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme.secondaryButton}`}>
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
    theme: typeof defaultTheme,
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

    const tokensToDisplay = useMemo((): TokenInfoDto[] => {
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
                tags: token.tags || [], // TokenInfoDto already has tags as string[]
                extensions: token.extensions || {},
            }));
        }

        const currentChain = blockchainData.find(chain => chain.chainId === chainId);
        let injectedTokens: TokenInfoDto[] = [];

        if (currentChain) {
            // 1. Handle native token injection
            const nativeTokenDetails = NATIVE_TOKENS_INFO[currentChain.name];
            if (nativeTokenDetails) {
                const isNativeTokenAlreadyPresent = fetchedTokens.some(
                    t => (t.symbol === nativeTokenDetails.symbol && t.tags?.includes('native')) || 
                         (t.address !== 'native' && nativeTokenDetails.address && t.address.toLowerCase() === nativeTokenDetails.address.toLowerCase())
                );

                if (!isNativeTokenAlreadyPresent) {
                    injectedTokens.push({
                        address: 'native', // Use 'native' as a special internal identifier
                        chainId: chainId,
                        decimals: nativeTokenDetails.decimals,
                        extensions: {},
                        logoURI: getTokenLogoURI('native', nativeTokenDetails.symbol, chainName), // Use special 'native' address for logo lookup
                        name: `${nativeTokenDetails.symbol} Native Token`,
                        symbol: nativeTokenDetails.symbol,
                        tags: ['native'], // Tag as 'native' for categorization
                    });
                } else {
                    // Ensure existing native-like tokens are tagged properly for categorization
                    const existingNativeToken = fetchedTokens.find(t => 
                        t.symbol === nativeTokenDetails.symbol || (nativeTokenDetails.address && t.address.toLowerCase() === nativeTokenDetails.address.toLowerCase())
                    );
                    if (existingNativeToken && !existingNativeToken.tags.includes('native')) {
                        existingNativeToken.tags.push('native');
                        // Ensure its logo is also updated if it's the native token
                        existingNativeToken.logoURI = existingNativeToken.logoURI || getTokenLogoURI(existingNativeToken.address, existingNativeToken.symbol, chainName);
                    }
                }
            }

            // 2. Handle common stablecoins injection
            COMMON_STABLECOINS_INFO.filter(sc => sc.chainId === currentChain.chainId).forEach(stablecoin => {
                const isStablecoinAlreadyPresent = fetchedTokens.some(
                    t => t.address.toLowerCase() === stablecoin.address.toLowerCase()
                );

                if (!isStablecoinAlreadyPresent) {
                    injectedTokens.push({
                        address: stablecoin.address,
                        chainId: stablecoin.chainId,
                        decimals: stablecoin.decimals,
                        extensions: {},
                        logoURI: stablecoin.logo || getTokenLogoURI(stablecoin.address, stablecoin.symbol, chainName),
                        name: stablecoin.name,
                        symbol: stablecoin.symbol,
                        tags: ['PEG:stablecoin'], // Ensure it's correctly tagged for categorization
                    });
                } else {
                    // If present but tags are missing or incorrect, update tags to ensure correct categorization
                    const existingToken = fetchedTokens.find(t => t.address.toLowerCase() === stablecoin.address.toLowerCase());
                    if (existingToken && !existingToken.tags.some(tag => tag.startsWith('PEG:'))) {
                        existingToken.tags.push('PEG:stablecoin');
                        // Ensure its logo is also updated if a better one is known
                        existingToken.logoURI = existingToken.logoURI || stablecoin.logo || getTokenLogoURI(existingToken.address, existingToken.symbol, chainName);
                    }
                }
            });
        }
        
        // Combine injected tokens (priority) with fetched tokens, filtering out duplicates
        const finalTokens = [...injectedTokens, ...fetchedTokens.filter(ft => 
            !injectedTokens.some(it => 
                (it.address === 'native' && it.symbol === ft.symbol) || // For native tokens
                (it.address !== 'native' && it.address.toLowerCase() === ft.address.toLowerCase()) // For ERC20 tokens
            )
        )];

        return finalTokens;
    }, [isSearchFocused, debouncedSearchTerm, searchedTokensData, tokenList, chainId, chainName]);

    const categorizedTokens = useMemo(() => {
        const categories: CategorizedTokens = {};
        for (const token of tokensToDisplay) {
            const categoryLabel = getCategory(token);
            if (!categories[categoryLabel]) {
                categories[categoryLabel] = [];
            }
            categories[categoryLabel].push(token);
        }
        
        for (const categoryLabel in categories) {
            categories[categoryLabel].sort((a, b) => {
                // Stablecoins and native tokens should always be at the top within their category
                const aIsStableOrNative = a.tags?.some(tag => tag.startsWith('PEG:') || tag === 'native');
                const bIsStableOrNative = b.tags?.some(tag => tag.startsWith('PEG:') || tag === 'native');

                if (aIsStableOrNative && !bIsStableOrNative) return -1;
                if (!aIsStableOrNative && bIsStableOrNative) return 1;

                // Then sort alphabetically by symbol
                return a.symbol.localeCompare(b.symbol);
            });
        }
        
        return categories;
    }, [tokensToDisplay]);
    
    const sortedCategories = useMemo(() => {
        return Object.keys(categorizedTokens).sort((a, b) => {
            const orderA = Object.values(TOKEN_CATEGORIES).find(c => c.label === a)?.order ?? 99;
            const orderB = Object.values(TOKEN_CATEGORIES).find(c => c.label === b)?.order ?? 99;
            return orderA - orderB;
        });
    }, [categorizedTokens]);

    // Derive full token info for selected tokens to display chips
    const selectedTokenDetails = useMemo(() => {
        if (selectedTokens.length === 0 || tokensToDisplay.length === 0) return [];
        return selectedTokens
            .map(symbol => tokensToDisplay.find(t => t.symbol === symbol))
            .filter((t): t is TokenInfoDto => !!t);
    }, [selectedTokens, tokensToDisplay]);
    
    return (
        <div>
            <label className={`block text-sm font-medium mb-2 ${theme.label}`}>
                Accepted Tokens on {chainName}
            </label>

            {selectedTokenDetails.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                        <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 px-2 py-1">{category}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2">
                            {categorizedTokens[category].map(token => (
                                <TokenItem
                                    // Use a robust key for list items, considering 'native' tokens might have same symbol as wrapped
                                    key={token.address === 'native' ? `${token.symbol}-${token.chainId}-native-item` : `${token.address}-item`}
                                    token={token}
                                    chainName={chainName}
                                    isChecked={selectedTokens.includes(token.symbol)}
                                    onTokenChange={onTokenChange}
                                />
                            ))}
                        </div>
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
      <div className="flex items-center justify-between mb-4">
        <label className={`flex items-center text-lg font-medium ${theme.text}`}>
            <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 font-bold">
                {chainInfo.name.charAt(0)}
            </span>
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
    </div>
  );
};
