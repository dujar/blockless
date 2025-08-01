import * as React from 'react';
import { useTokenDetails } from '../hooks/useTokenDetails';
import { useTokenPrice } from '../hooks/useTokenPrice';
import type { ActiveOrdersOutput } from '../../../services/types';
import { getChainDetailsByChainId } from '../../../data/blockchains';

interface BlockchainTokenPaymentOptionProps {
  order: ActiveOrdersOutput;
}

export function BlockchainTokenPaymentOption({ order }: BlockchainTokenPaymentOptionProps) {
  const { makingAmount, makerAsset } = order.order;
  const { srcChainId } = order;
  const srcChain = getChainDetailsByChainId(srcChainId);

  // Fetch details for the primary token (makerAsset)
  const { data: makerToken, isLoading: isLoadingMakerToken, error: makerTokenError } = useTokenDetails(srcChainId, makerAsset);

  // Fetch USD price for the primary token
  const { data: makerTokenUsdPrice, isLoading: isLoadingMakerTokenPrice, error: makerTokenPriceError } = useTokenPrice(srcChainId, makerAsset);

  // Determine native token details
  // Note: nativeTokenAddress is typically for wrapped native tokens,
  // but for fetching spot price of the actual native token, we use its 'tokenId' or 'symbol' depending on API.
  // The SpotPriceService's `getPricesByAddresses` expects an address.
  // We use `srcChain?.nativeToken?.tokenId` if available, otherwise `srcChain?.nativeTokenAddress` as a fallback
  // if the native token itself is also an ERC20 for price lookup, or `nativeToken.tokenSymbol` might be needed for spot price lookup.
  // For simplicity, we'll try to use the native token address if available, or its symbol.
  // The `spotPriceService` seems to accept addresses. Let's assume the nativeToken.tokenId is its address for price lookup, or we use its symbol if it's listed.
  // Given `native-tokens.json` `tokenId` is like "ethereum", not an address.
  // Re-evaluating `spotPriceService.getPricesByAddresses`: it expects token addresses.
  // `blockchainData.nativeTokenAddress` is a good candidate for wrapped native token addresses, which can be looked up.
  // For the actual *native* token (e.g., ETH, BNB), if it's not wrapped, its address is often "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" or similar special address on 1inch.
  // For now, we'll try using `srcChain?.nativeTokenAddress` for price lookup if it's an EVM chain.
  // If `srcChain?.nativeToken` is available, its `tokenSymbol` could be used for display.
  const nativeTokenAddressForPrice = srcChain?.nativeTokenAddress || (srcChain?.isEVM ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' : undefined);
  const nativeTokenInfo = srcChain?.nativeToken;

  // Fetch USD price for the native token (or its wrapped equivalent for price lookup)
  const { data: nativeTokenUsdPrice, isLoading: isLoadingNativeTokenPrice, error: nativeTokenPriceError } = useTokenPrice(srcChainId, nativeTokenAddressForPrice);

  // Helper to format large numbers (e.g., Wei) to a more readable string with correct decimals.
  const formatAmount = (amount: string | undefined, decimals: number | undefined): string => {
    if (!amount || decimals === undefined) return 'N/A';
    try {
        const bigIntAmount = BigInt(amount);
        // Calculate the divisor for the given decimals
        const divisor = BigInt(10) ** BigInt(decimals);

        // Get the integer part
        const integerPart = bigIntAmount / divisor;

        // Get the fractional part
        const fractionalPart = bigIntAmount % divisor;

        // Convert fractional part to string, pad with leading zeros if necessary
        const fractionalString = fractionalPart.toString().padStart(decimals, '0');

        // Combine integer and fractional parts, trimming trailing zeros from fractional part
        let formatted = `${integerPart}`;
        if (decimals > 0) {
            // Remove trailing zeros from fractional part
            const trimmedFractional = fractionalString.replace(/0+$/, '');
            formatted += trimmedFractional ? `.${trimmedFractional}` : '';
        }
        return formatted;
    } catch (e) {
        console.error("Error formatting amount:", e);
        return 'Invalid Amount';
    }
  };

  const renderLoading = () => (
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 animate-pulse">
      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </div>
  );

  const renderError = (error: Error) => (
    <div className="text-red-500 text-sm">Error: {error.message}</div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Token Payment Option (Token to be sent by the maker) */}
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">You will pay with</h3>
        {isLoadingMakerToken || isLoadingMakerTokenPrice ? (
          renderLoading()
        ) : makerTokenError ? (
          renderError(makerTokenError)
        ) : makerToken ? (
          <div className="flex items-center space-x-3">
            {makerToken.logoURI && (
              <img src={makerToken.logoURI} alt={`${makerToken.symbol} Logo`} className="w-8 h-8 rounded-full object-contain" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {formatAmount(makingAmount, makerToken.decimals)} {makerToken.symbol}
              </p>
              {makerTokenUsdPrice && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ~ ${Number(makerTokenUsdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Payment token details not available.</p>
        )}
      </div>

      {/* Native Blockchain Token (for gas fees or alternative payment) */}
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Native Blockchain Token (for Gas)</h3>
        {isLoadingNativeTokenPrice ? (
          renderLoading()
        ) : nativeTokenPriceError ? (
          renderError(nativeTokenPriceError)
        ) : srcChain && nativeTokenInfo ? (
          <div className="flex items-center space-x-3">
            {nativeTokenInfo.logo && (
              <img src={nativeTokenInfo.logo} alt={`${nativeTokenInfo.tokenSymbol} Logo`} className="w-8 h-8 rounded-full object-contain" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {nativeTokenInfo.tokenSymbol} ({srcChain.name})
              </p>
              {nativeTokenUsdPrice && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ~ ${Number(nativeTokenUsdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              )}
              {!nativeTokenUsdPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Price not available.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Native token details not available for this chain.</p>
        )}
      </div>
    </div>
  );
}

