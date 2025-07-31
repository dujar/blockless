import { useQuery } from '@tanstack/react-query';
import { QuoterService } from '../../../services/fusion-service';
import type { GetQuoteParams, GetQuoteOutput } from '../../../services/types';

/**
 * React Query hook to fetch a Fusion+ cross-chain quote.
 * 
 * @param params - Quote request parameters containing srcChain, dstChain, 
 *                 srcTokenAddress, dstTokenAddress, amount, and walletAddress
 * @returns Query result containing the quote data or error information
 */
export const useFusionQuote = (params: GetQuoteParams) => {
  return useQuery<GetQuoteOutput, Error>({
    queryKey: ['fusion-quote', params],
    queryFn: async () => {
      try {
        return await new QuoterService().getQuote(params);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch quote: ${error.message}`);
        }
        throw new Error('Failed to fetch quote');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,  // 10 minutes
    retry: (_failureCount, error) => {
      // Retry on network errors and 5xx status codes
      const isNetworkError = error.message.includes('Network Error');
      const isServerError = error.message.startsWith('5');
      
      return isNetworkError || isServerError;
    },
    refetchOnWindowFocus: false
  });
};
