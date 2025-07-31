import { useQuery } from '@tanstack/react-query';
import { QuoterService } from '../../../services/fusion-service';
import { useChainContext } from '../context/CrossChainContext';
import type { GetQuoteParams } from '../../../services/types';
import { TokenService } from '../../../services/token-service';

/**
 * Hook to fetch available payment options for cross-chain swap
 */
export function useAvailableOrders(quoteParams: GetQuoteParams) {
  const { getChainById } = useChainContext();

  return useQuery({
    queryKey: ['availableOrders', quoteParams.srcChain, quoteParams.dstChain],
    queryFn: async () => {
      // 1. Get base quote
      const quote = await new QuoterService().getQuote(quoteParams);

      // 2. Get all supported chains
      const  supportedChains  = await new TokenService().getSupportedChains();

      // 3. Transform API response to payment options
      return supportedChains.map(chainId => {
        const chain = getChainById(chainId);
        // const isNativeToken = chain?.nativeCurrency.symbol === dstToken;
        
        return {
          chainId,
          // srcTokenAddress: quote.srcTokenAddress,
          // dstTokenAddress: quote.dstTokenAddress,
          amount: quote.srcTokenAmount.toString(),
          estimatedPrice: {
            dstTokenAmount: quote.dstTokenAmount,
            estimatedUsdValue: parseFloat(quote.prices.usd.dstToken)
          },
          // isNativeToken
        };
      });
    },
    enabled: !!quoteParams.srcChain && !!quoteParams.dstChain,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
