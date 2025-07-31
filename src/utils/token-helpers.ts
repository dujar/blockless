import type { TokenInfoDto } from '../services/types';
import { blockchainData } from '../data/blockchains';
import { countries } from '../data/countries';
import nativeTokensJson from '../data/native-tokens.json'; // Import native-tokens.json


// Import specific token logos
import ethLogo from '../assets/eth.svg';
import bnbLogo from '../assets/bnb.svg';
import maticLogo from '../assets/matic.svg';
import avaxLogo from '../assets/avax.svg';
import usdcLogo from '../assets/usdc.svg';
import daiLogo from '../assets/dai.svg';
import usdtLogo from '../assets/usdt.svg';
import blocklessLogo from '../assets/blockless.svg'; // Using for fallback/generic logos

export const NATIVE_TOKENS_INFO: { [chainName: string]: { symbol: string; address: string; decimals: number; logo: string; } } = {
  "Ethereum": { symbol: "ETH", address: "0xc02aaa39b223fe8d0a0e5c4f27eAD9083C756Cc2", decimals: 18, logo: ethLogo }, // WETH address
  "BNB Chain": { symbol: "BNB", address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", decimals: 18, logo: bnbLogo }, // WBNB address
  "Polygon": { symbol: "MATIC", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", decimals: 18, logo: maticLogo }, // WMatic address
  "Arbitrum": { symbol: "ETH", address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", decimals: 18, logo: ethLogo }, // WETH address on Arbitrum
  "Optimism": { symbol: "ETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: ethLogo }, // WETH address on Optimism
  "Avalanche": { symbol: "AVAX", address: "0xb31f66aa3c1e785363f0d87a628ed8fdc74d406b", decimals: 18, logo: avaxLogo }, // WAVAX address
  "Base": { symbol: "ETH", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: ethLogo }, // WETH address on Base
  "Linea": { symbol: "ETH", address: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f", decimals: 18, logo: ethLogo }, // WETH address on Linea
};

export const COMMON_STABLECOINS_INFO: { chainId: number; symbol: string; name: string; address: string; decimals: number; logo: string; }[] = [
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

export const TOKEN_CATEGORIES = {
  STABLECOINS: { order: 0, label: 'Stablecoins' },
  MAJOR_ASSETS: { order: 1, label: 'Major Assets' }, // This will include native tokens
  VERIFIED: { order: 2, label: 'Verified Tokens' },
  WARNING: { order: 3, label: 'Tokens with Warnings' },
  HIGH_RISK: { order: 4, label: 'High-Risk Tokens' },
};

export const getRiskInfo = (tags: string[] = []) => {
    // Ensure tags are lowercased and trimmed for consistent comparison
    const normalizedTags = tags.map(tag => tag.toLowerCase().trim());

    if (normalizedTags.includes('risk:malicious')) return { level: 4, label: 'Malicious', description: 'This token is flagged as malicious. Interacting with it is extremely risky.', color: 'text-red-600 dark:text-red-500' };
    if (normalizedTags.includes('risk:suspicious')) return { level: 3, label: 'Suspicious', description: 'This token is flagged as suspicious. High risk involved.', color: 'text-red-500 dark:text-red-400' };
    if (normalizedTags.includes('risk:unverified')) return { level: 2, label: 'Unverified', description: 'This token is not verified by 1inch. Please do your own research.', color: 'text-yellow-500 dark:text-yellow-400' };
    if (normalizedTags.includes('risk:availability')) return { level: 1, label: 'Availability Risk', description: 'This token might have low liquidity or other availability issues.', color: 'text-yellow-400 dark:text-yellow-300' };
    return { level: 0, label: 'Verified', description: 'This token appears to be safe.', color: 'text-green-500 dark:text-green-400' };
};

export const getCategory = (token: TokenInfoDto) => {
    // Ensure tags are lowercased and trimmed for consistent comparison
    const normalizedTags = token.tags?.map(tag => tag.toLowerCase().trim()) || [];
    
    // First, prioritize specific categories based on tags, regardless of general risk
    const isStablecoin = normalizedTags.some(t => t.startsWith('peg:'));
    const isNativeAsset = normalizedTags.includes('native');

    if (isStablecoin) {
        return TOKEN_CATEGORIES.STABLECOINS.label;
    }
    
    if (isNativeAsset) {
        return TOKEN_CATEGORIES.MAJOR_ASSETS.label;
    }

    // Then, apply risk-based categorization for other tokens
    const riskInfo = getRiskInfo(normalizedTags);
    if (riskInfo.level >= 3) return TOKEN_CATEGORIES.HIGH_RISK.label;
    if (riskInfo.level >= 1) return TOKEN_CATEGORIES.WARNING.label;
    
    return TOKEN_CATEGORIES.VERIFIED.label;
};

/**
 * Provides a logo URI for a token, preferring explicit local logos for native tokens/common stablecoins,
 * then 1inch CDN, then a generic fallback.
 */
export const getTokenLogoURI = (tokenAddress: string, tokenSymbol: string, chainName: string): string => {
    // 1. Check for explicit local logos for native tokens first
    const nativeTokenInfo = NATIVE_TOKENS_INFO[chainName];
    if (nativeTokenInfo && (tokenAddress === 'native' || tokenAddress.toLowerCase() === nativeTokenInfo.address.toLowerCase())) {
        return nativeTokenInfo.logo;
    }
    
    // 2. Check for explicit local logos for common stablecoins
    const commonStablecoinInfo = COMMON_STABLECOINS_INFO.find(sc => 
        sc.symbol.toLowerCase() === tokenSymbol.toLowerCase() && (sc.address.toLowerCase() === tokenAddress.toLowerCase() || tokenAddress === 'native')
    );
    if (commonStablecoinInfo && commonStablecoinInfo.logo) {
        return commonStablecoinInfo.logo;
    }

    // 3. Use 1inch token logo CDN for standard ERC20 tokens
    if (tokenAddress && tokenAddress !== 'native' && tokenAddress !== '0x' + 'a'.repeat(40)) { // Exclude mock address too
        return `https://tokens.1inch.io/${tokenAddress.toLowerCase()}.png`;
    }

    // 4. Fallback to generic Blockless logo
    return blocklessLogo; 
};

/**
 * Retrieves the logo for a blockchain, primarily from native-tokens.json mapping.
 * @param chainId The chain ID of the blockchain.
 * @param chainName The display name of the blockchain.
 * @returns The URL of the blockchain logo, or undefined if not found.
 */
export const getBlockchainLogo = (chainName: string): string | undefined => {
    // Map internal chain names to what's used in native-tokens.json if different (e.g., "BNB Chain" -> "binancecoin")
    const idMap: { [key: string]: string } = {
        'BNB Chain': 'binancecoin',
        'Polygon': 'polygon',
        'Ethereum': 'ethereum',
        'Avalanche': 'avalanche',
        'Arbitrum': 'arbitrum',
        'Optimism': 'optimism',
        'Base': 'base',
        'Linea': 'linea',
        // Add other mappings if chainName differs from blockchain ID in native-tokens.json
    };
    const lookupId = idMap[chainName] || chainName.toLowerCase().replace(/\s/g, ''); // Use mapped ID or a simple lowercase conversion

    // Try to find the logo from NATIVE_TOKENS_INFO (which uses explicit local imports)
    const nativeInfo = NATIVE_TOKENS_INFO[chainName];
    if (nativeInfo && nativeInfo.logo) {
        return nativeInfo.logo;
    }

    // Fallback to native-tokens.json (which typically has more generic blockchain images from Coingecko)
    const tokenInfo = (nativeTokensJson as { blockchain: string; logo: string }[]).find(token => token.blockchain === lookupId);
    return tokenInfo?.logo;
};


export const injectAndCategorizeTokens = (fetchedTokens: TokenInfoDto[], chainId: number, chainName: string) => {
    const currentChain = blockchainData.find(chain => chain.chainId === chainId);
    const injectedTokens: TokenInfoDto[] = [];

    if (currentChain) {
        // 1. Handle native token injection
        const nativeTokenDetails = NATIVE_TOKENS_INFO[currentChain.name];
        if (nativeTokenDetails) {
            // Check if native token is already present by symbol AND either 'native' tag OR matching address
            const isNativeTokenAlreadyPresent = fetchedTokens.some(
                t => t.symbol.toLowerCase() === nativeTokenDetails.symbol.toLowerCase() && 
                     (t.tags?.includes('native') || (nativeTokenDetails.address && t.address.toLowerCase() === nativeTokenDetails.address.toLowerCase()))
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
                // And update logoURI if it's generic and we have a specific one
                const existingNativeToken = fetchedTokens.find(t => 
                    t.symbol.toLowerCase() === nativeTokenDetails.symbol.toLowerCase() || 
                    (nativeTokenDetails.address && t.address.toLowerCase() === nativeTokenDetails.address.toLowerCase())
                );
                if (existingNativeToken) {
                    if (!existingNativeToken.tags.includes('native')) {
                        existingNativeToken.tags.push('native');
                    }
                    // Only update logoURI if it's currently a generic one or empty
                    if (!existingNativeToken.logoURI || existingNativeToken.logoURI === blocklessLogo) {
                       existingNativeToken.logoURI = nativeTokenDetails.logo;
                    }
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
                if (existingToken) {
                    if (!existingToken.tags.some(tag => tag.toLowerCase().startsWith('peg:'))) {
                        existingToken.tags.push('PEG:stablecoin');
                    }
                    // Ensure its logo is also updated if a better one is known
                    if (!existingToken.logoURI || existingToken.logoURI === blocklessLogo) {
                        existingToken.logoURI = stablecoin.logo || getTokenLogoURI(existingToken.address, existingToken.symbol, chainName);
                    }
                }
            }
        });
    }
    
    // Combine injected tokens (priority) with fetched tokens, filtering out duplicates
    const finalTokens = [...injectedTokens, ...fetchedTokens.filter(ft => 
        !injectedTokens.some(it => 
            (it.address === 'native' && it.symbol.toLowerCase() === ft.symbol.toLowerCase()) || // For native tokens
            (it.address !== 'native' && it.address.toLowerCase() === ft.address.toLowerCase()) // For ERC20 tokens
        )
    )];

    const categories: { [category: string]: TokenInfoDto[] } = {};
    for (const token of finalTokens) {
        const categoryLabel = getCategory(token); // Use getCategory from token-helpers
        if (!categories[categoryLabel]) {
            categories[categoryLabel] = [];
        }
        categories[categoryLabel].push(token);
    }
    
    for (const categoryLabel in categories) {
        categories[categoryLabel].sort((a, b) => {
            // Stablecoins and native tokens should always be at the top within their category
            const aIsStableOrNative = (a.tags?.some(tag => tag.toLowerCase().startsWith('peg:')) || a.tags?.includes('native'));
            const bIsStableOrNative = (b.tags?.some(tag => tag.toLowerCase().startsWith('peg:')) || b.tags?.includes('native'));

            if (aIsStableOrNative && !bIsStableOrNative) return -1;
            if (!aIsStableOrNative && bIsStableOrNative) return 1;

            // Then sort alphabetically by symbol
            return a.symbol.localeCompare(b.symbol);
        });
    }
    
    const sortedCategories = Object.keys(categories).sort((a, b) => {
        const orderA = Object.values(TOKEN_CATEGORIES).find(c => c.label === a)?.order ?? 99;
        const orderB = Object.values(TOKEN_CATEGORIES).find(c => c.label === b)?.order ?? 99;
        return orderA - orderB;
    });

    const orderedTokens: TokenInfoDto[] = [];
    for(const category of sortedCategories) {
        orderedTokens.push(...categories[category]);
    }

    return orderedTokens;
}

/**
 * Interface for a processed currency data, derived from raw country data.
 */
export interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  countries: {
    name: string;
    flag: string;
  }[];
}

/**
 * Extracts and consolidates currency data from a list of country objects.
 * This is useful for building a comprehensive list of supported fiat currencies
 * with their symbols and associated country flags.
 * @param countriesArray An array of country objects, typically from a data source like `src/data/countries.ts`.
 * @returns An array of `CurrencyData` objects, sorted alphabetically by currency name.
 */
export const getCurrencyDataFromCountries = (countriesArray: typeof countries): CurrencyData[] => {
    const currencies: Record<string, { name: string; symbol: string; countries: { name: string; flag: string }[] }> = {};
  
    if (Array.isArray(countriesArray)) {
      countriesArray.forEach(country => {
        if (!country.currencies || Object.keys(country.currencies).length === 0) return;
        
        for (const code in country.currencies) {
          const currency = (country.currencies as Record<string, { name: string; symbol: string }>)[code];
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
};

