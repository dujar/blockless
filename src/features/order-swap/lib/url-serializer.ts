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
  // Decimals are often available via token-service or inferred from common tokens.
  // Removing decimals from direct serialization to reduce payload size,
  // as they can be re-fetched or re-inferred during rehydration.
  // If specific decimals are critical and cannot be inferred, they might need to be kept.
  // For this context, assuming `rehydrateTokenInfo` can handle this.
  decimals: tokenInfo.decimals, // Keep decimals as it's directly used in formatAmount
  chainId: tokenInfo.chainId,
});




export const encodeJsonToBase64 = (jsonObj: any): string =>{
  const jsonString = JSON.stringify(jsonObj);
  return btoa(unescape(encodeURIComponent(jsonString)));
}
/**
 * Converts an OrderData (from useCreateOrderForm) into a SerializedOrderData suitable for storage.
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
 * Decodes a Base64 string from a URL parameter back into SerializedOrderData.
 * NOTE: This function is being phased out as order data will be stored in sessionStorage.
 * It remains here for historical context or if needed for other specific, short parameters.
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
    decimals: decimals, // Use provided decimals, or default if not available from a source
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
 * @param serializedData The SerializedOrderData object from the URL or storage.
 * @param orderId Optional ID from the URL, used to reconstruct orderSwapUrl.
 * @returns The rehydrated OrderData object.
 */
export const rehydrateOrderData = (serializedData: SerializedOrderData, orderId?: string): RehydratedOrderData => {
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
              // Use token address for 1inch deeplink if it's not 'native' or a mock address.
              // For native tokens, 1inch usually prefers its canonical address (WETH, WMATIC, etc.).
              // Using token.info.address directly for 1inch links as it's expected to be a contract address or special '0xeeee' for native.
              const tokenIdentifier = token.info.address; 
              const dst = `${token.info.chainId}:${token.amount}:${tokenIdentifier}:${chain.address}`;
              validDstParams.push(dst);
          }
      });
  });

  let crossChainUrl = '';
  if (validDstParams.length > 0) {
      validDstParams.forEach(param => crossChainParams.append('dst', param));
      // Construct URL for the 1inch app swap page
      crossChainUrl = `https://app.1inch.io/swap?${crossChainParams.toString()}`;
  }

  // REVISED: If orderId is provided, reconstruct the orderSwapUrl for *this* page.
  // The `encodeJsonToBase64(serializedData)` is not needed here as `orderId` *is* the encoded data.
  const orderSwapUrl = orderId ? `${window.location.origin}/order?id=${orderId}` : "";

  return {
    fiatAmount: serializedData.fiatAmount,
    fiatCurrency: serializedData.fiatCurrency,
    chains: rehydratedChains,
    crossChainUrl,
    orderSwapUrl, // Use the reconstructed URL
  };
};

