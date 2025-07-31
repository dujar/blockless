import { useQueries } from '@tanstack/react-query';
import { TokenDetailsService } from '../services/token-details-service';

/**
 * Hook to fetch token logos from the 1inch Token Details API.
 * @param tokenAddresses Map of chainIds to token addresses.
 * @returns Map of token identifiers to their logo URLs.
 */
export function useTokenLogos(tokenAddresses: Record<number, string[]>) {
    return useQueries({
        queries: Object.entries(tokenAddresses).map(([chainIdStr, addresses]) => {
            const chainId = parseInt(chainIdStr);
            return {
                queryKey: ['token-logos', chainId, addresses.join(',')],
                queryFn: async () => {
                    const service = new TokenDetailsService();
                    return await service.getMultipleTokensLogo(
                        chainId,
                        addresses
                    );
                },
                staleTime: 1000 * 60 * 60 // 1 hour
            };
        })
    });
}
