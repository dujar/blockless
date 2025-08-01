import { useQuery } from '@tanstack/react-query';
import { TokenService } from '../../../services/token-service';
import type { TokenDto } from '../../../services/types';

const tokenService = new TokenService();

/**
 * Custom hook to fetch details for a specific token.
 * @param chainId The ID of the chain where the token resides.
 * @param tokenAddress The address of the token.
 * @returns A query result object containing the token details or an error.
 */
export function useTokenDetails(chainId: number | undefined, tokenAddress: string | undefined) {
  return useQuery<TokenDto, Error>({
    queryKey: ['tokenDetails', chainId, tokenAddress],
    queryFn: async () => {
      if (!chainId || !tokenAddress) {
        throw new Error('Chain ID and token address are required to fetch token details.');
      }
      return tokenService.getCustomToken(chainId, tokenAddress);
    },
    enabled: !!chainId && !!tokenAddress, // Only run the query if both chainId and tokenAddress are available
  });
}

