import { useQuery } from '@tanstack/react-query';
import { spotPriceService, SpotCurrency } from '../../../services/spot-price-service';
import type { PricesResponse } from '../../../services/types';

/**
 * Custom hook to fetch the USD price of a specific token.
 * @param chainId The ID of the chain where the token resides.
 * @param tokenAddress The address of the token.
 * @returns A query result object containing the token's USD price or an error.
 */
export function useTokenPrice(chainId: number | undefined, tokenAddress: string | undefined) {
  return useQuery<string | undefined, Error>({
    queryKey: ['tokenPriceUsd', chainId, tokenAddress],
    queryFn: async () => {
      if (!chainId || !tokenAddress) {
        return undefined; // No price if chainId or tokenAddress is missing
      }
      const prices: PricesResponse = await spotPriceService.getPricesByAddresses(chainId, [tokenAddress], SpotCurrency.USD);
      return prices[tokenAddress]; // Return the price string for the requested token
    },
    enabled: !!chainId && !!tokenAddress, // Only run the query if both chainId and tokenAddress are available
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data cached for 10 minutes
  });
}

