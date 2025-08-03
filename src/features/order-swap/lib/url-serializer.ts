import type {
  SerializableTokenDetails,
  SerializedOrderData,
  RehydratedOrderData,
} from '../types';
import { getTokenLogoURI, NATIVE_TOKENS_INFO, COMMON_STABLECOINS_INFO, getCategory, TOKEN_CATEGORIES } from '../../../utils/token-helpers';
import { blockchainData, getChainDetailsByChainId } from '../../../data/blockchains';
import type { TokenInfoDto } from '../../../services/types';


/**
 * Converts a TokenInfoDto to a minimal SerializableTokenDetails for URL serialization.
 * @param tokenInfo The full TokenInfoDto.
 * @returns Minimal serializable token details.
 */
const toSerializableTokenDetails = (tokenInfo: TokenInfoDto): SerializableTokenDetails => ({
  symbol: tokenInfo.symbol,
  address: tokenInfo.address,
  decimals: tokenInfo.decimals,
  chainId: tokenInfo.chainId,
});

/**
 * Converts an OrderData (from useCreateOrderForm) into a SerializedOrderData suitable for URL params.
 * This simplifies the TokenInfoDto to only essential fields.
 * @param orderData The order data from useCreateOrderForm.
 * @returns Serialized order data object.
 */
export const serializeOrderData = (orderData: RehydratedOrderData): SerializedOrderData => {
  return {
    fiatAmount: orderData.fiatAmount,
    fiatCurrency: orderData.fiatCurrency,
    chains: orderData.chains.map(chain => ({
      name: chain.name,
      address: chain.address,
      chainId: chain.chainId,
      tokens: chain.tokens.map(token => ({
        symbol: token.symbol,
        amount: token.amount,
        info: toSerializableTokenDetails(token.info),
      })),
    })),
  };
};

/**
 * Encodes the serialized order data into a Base64 string for URL safety and compactness.
 * @param data The SerializedOrderData object.
 * @returns A Base64 encoded string.
 */
export const encodeOrderToUrlParam = (data: SerializedOrderData): string => {
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
};

/**
 * Decodes a Base64 string from a URL parameter back into SerializedOrderData.
 * @param encodedString The Base64 encoded string.
 * @returns The decoded SerializedOrderData object.
 * @throws Error if decoding or parsing fails.
 */
export const decodeOrderFromUrlParam = (encodedString: string): SerializedOrderData => {
  try {
    const jsonString = atob(encodedString);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decode or parse order data from URL:", error);
    throw new Error("Invalid order data in URL.");
  }
};

/**
 * Rehydrates simplified token details into a full TokenInfoDto.
 * It attempts to enrich the data using local constants and then falls back to basic info.
 * @param serializableToken The simplified token details.
 * @returns A full TokenInfoDto.
 */
const rehydrateTokenInfo = (serializableToken: SerializableTokenDetails): TokenInfoDto => {
  const { symbol, address, chainId, decimals } = serializableToken;
  const chainName = getChainDetailsByChainId(chainId)?.name || `Chain-${chainId}`;

  // Attempt to find in NATIVE_TOKENS_INFO
  const nativeInfo = NATIVE_TOKENS_INFO[chainName];
  if (nativeInfo && (address === 'native' || address.toLowerCase() === nativeInfo.address.toLowerCase()) && symbol.toLowerCase() === nativeInfo.symbol.toLowerCase()) {
    return {
      address: nativeInfo.address,
      chainId,
      decimals: nativeInfo.decimals,
      extensions: {},
      logoURI: nativeInfo.logo,
      name: nativeInfo.symbol, // Use symbol as name if native token doesn't have a specific name provided
      symbol: nativeInfo.symbol,
      tags: ['native'],
    };
  }

  // Attempt to find in COMMON_STABLECOINS_INFO
  const stablecoinInfo = COMMON_STABLECOINS_INFO.find(sc =>
    sc.chainId === chainId && sc.address.toLowerCase() === address.toLowerCase() && sc.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (stablecoinInfo) {
    return {
      address: stablecoinInfo.address,
      chainId,
      decimals: stablecoinInfo.decimals,
      extensions: {},
      logoURI: stablecoinInfo.logo,
      name: stablecoinInfo.name,
      symbol: stablecoinInfo.symbol,
      tags: ['PEG:stablecoin'],
    };
  }

  // Fallback if not found in local constants
  return {
    address: address,
    chainId: chainId,
    decimals: decimals,
    extensions: {},
    logoURI: getTokenLogoURI(address, symbol, chainName),
    name: symbol, // Default name to symbol
    symbol: symbol,
    tags: [], // No specific tags inferred
  };
};

/**
 * Reconstructs the full OrderData object from the SerializedOrderData.
 * This re-adds the detailed TokenInfoDto and regenerates the crossChainUrl (for the /swap route).
 * @param serializedData The SerializedOrderData object from the URL.
 * @returns The rehydrated OrderData object.
 */
export const rehydrateOrderData = (serializedData: SerializedOrderData): RehydratedOrderData => {
  const rehydratedChains = serializedData.chains.map(chain => {
    const rehydratedTokens = chain.tokens.map(token => ({
      symbol: token.symbol,
      amount: token.amount,
      info: rehydrateTokenInfo(token.info),
    }));

    // Re-sort tokens based on category and amount as in useCreateOrderForm
    rehydratedTokens.sort((a, b) => {
      const aHasAmount = parseFloat(a.amount) > 0;
      const bHasAmount = parseFloat(b.amount) > 0;
      if (aHasAmount !== bHasAmount) return aHasAmount ? -1 : 1;
      const categoryA = getCategory(a.info);
      const categoryB = getCategory(b.info);
      const orderA = Object.values(TOKEN_CATEGORIES).find(c => c.label === categoryA)?.order ?? 99;
      const orderB = Object.values(TOKEN_CATEGORIES).find(c => c.label === categoryB)?.order ?? 99;
      return orderA - orderB;
    });

    return {
      ...chain,
      chainId: blockchainData.find(b => b.name === chain.name)?.chainId || 0,
      tokens: rehydratedTokens,
    };
  });

  const crossChainParams = new URLSearchParams();
  const validDstParams: string[] = [];
  rehydratedChains.forEach(chain => {
      chain.tokens.forEach(token => {
          if (parseFloat(token.amount) > 0 && chain.address && token.info.symbol) {
              const chainName = getChainDetailsByChainId(token.info.chainId)?.name || chain.name;
              const dst = `${chainName}:${token.amount}:${token.info.symbol}:${chain.address}`;
              validDstParams.push(dst);
          }
      });
  });

  let crossChainUrl = '';
  if (validDstParams.length > 0) {
      validDstParams.forEach(param => crossChainParams.append('dst', param));
      // Construct URL relative to origin, which will be the app's base URL for the /swap route
      crossChainUrl = `${window.location.origin}/swap?${crossChainParams.toString()}`;
  }

  return {
    fiatAmount: serializedData.fiatAmount,
    fiatCurrency: serializedData.fiatCurrency,
    chains: rehydratedChains,
    crossChainUrl,
    orderSwapUrl: crossChainUrl,
  };
};

