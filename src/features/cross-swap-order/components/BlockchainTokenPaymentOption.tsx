import React from "react";
import { useQuery } from '@tanstack/react-query';
import type { TokenInfoDto } from "../../../services/types";
import { TokenService } from "../../../services/token-service";
import { getChainDetailsByNetworkId, type BlockchainData } from "../../../data/blockchains";
import type { Block } from "viem";
import type { Blockchain } from "../context/types";

export const BlockchainTokenPaymentOption: React.FC<{order: {
  token: string,
  dstAddress:string,
  amount: number,
  chain: BlockchainData
}}> = ({order}) => {
  // srcChainId from ActiveOrdersOutput refers to the networkId for the chain the order is on.
  const sourceNetworkId = order.chain.networkId;
  const takerAssetAddress = order.token;;
  const takerAmount = order.amount;

  // Get blockchain data using the networkId from the order.
  const chain = getChainDetailsByNetworkId(sourceNetworkId);

  // Query for the symbol, logo, and other info of the token being taken (takerAsset)
  const { data: takerTokenInfo } = useQuery<TokenInfoDto>({
    queryKey: ['takerTokenInfo', sourceNetworkId, takerAssetAddress],
    queryFn: async () => {
      if (!sourceNetworkId || !takerAssetAddress) {
        throw new Error('Source chain ID or taker asset address is missing for order token details.');
      }
      const service = new TokenService();
      // Using getCustomTokens to fetch comprehensive token information, including logo and price.
      const response = await service.getCustomTokens(sourceNetworkId, [takerAssetAddress]);
      return response[takerAssetAddress];
    },
    enabled: !!sourceNetworkId && !!takerAssetAddress,
  });

  // Query for native token details (logo, symbol, price)
  const { data: nativeTokenDetails } = useQuery<TokenInfoDto>({
    queryKey: ['nativeTokenDetails', sourceNetworkId, chain?.nativeTokenAddress],
    queryFn: async () => {
      if (!sourceNetworkId || !chain?.nativeTokenAddress) {
        throw new Error('Source chain ID or native token address is missing for native token details.');
      }
      const service = new TokenService();
      // Using getCustomTokens for native token details as well.
      const response = await service.getCustomTokens(sourceNetworkId, [chain.nativeTokenAddress]);
      return response[chain.nativeTokenAddress];
    },
    enabled: !!sourceNetworkId && !!chain?.nativeTokenAddress,
  });

  // Render nothing if chain details are not yet available.
  if (!chain) {
    return null;
  }

  return (
    <div
      className="space-y-4"
    >
      <button
        className={`
          w-full p-4 rounded-lg border
          border-gray-200 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          dark:border-gray-700 dark:hover:border-primary-600 dark:bg-gray-800
        `}
      >
        <div className="flex flex-col gap-2">
            {/* Display for the order's main token (takerAsset) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {takerTokenInfo?.logoURI && (
                    <img
                        src={takerTokenInfo.logoURI}
                        alt={`${takerTokenInfo.symbol || 'Token'} logo`}
                        className="h-6 w-6 rounded-full"
                    />
                    )}
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{takerTokenInfo?.symbol || takerAssetAddress}</span>
                </div>
                <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{takerAmount}</span>
                </div>
            </div>

            {/* Display for the blockchain's native token (payment method) */}
            {chain.nativeTokenAddress && (
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex items-center space-x-2">
                        {nativeTokenDetails?.logoURI && (
                            <img
                                src={nativeTokenDetails.logoURI}
                                alt={`${nativeTokenDetails.symbol || 'Native Token'} logo`}
                                className="h-4 w-4 rounded-full"
                            />
                        )}
                        <span>Pay with {nativeTokenDetails?.symbol || 'Native Token'}</span>
                    </div>
                    {/* Display price in USD if available, otherwise 'Price N/A' */}
                    {nativeTokenDetails?.price ? (
                        <div>
                            <span>~${parseFloat(nativeTokenDetails.price).toFixed(2)}</span>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">Price N/A</div>
                    )}
                </div>
            )}
        </div>
      </button>
    </div>
  );
};
