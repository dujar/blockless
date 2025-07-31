import { useQuery } from '@tanstack/react-query';
import { TokenDetailsService } from '../../../services/token-details-service';
import type { TokenInfoDto } from '../../../services/types';

interface UseTokenDetailsParams {
    chainId: number;
    tokenAddress: string;
}

interface UseTokenDetailsResult {
    data: TokenInfoDto | undefined;
    isLoading: boolean;
    error: Error | null;
}

export const useTokenDetails = (params: UseTokenDetailsParams): UseTokenDetailsResult => {
    const tokenDetailsService = new TokenDetailsService();

    const result = useQuery<TokenInfoDto, Error>({
        queryKey: ['tokenDetails', params.chainId, params.tokenAddress],
        queryFn: async () => {
            // Parallel fetch for token symbol and price
            const [symbolRes, nameRes, decimalsRes, logoRes] = await Promise.all([
                tokenDetailsService.getTokenSymbol(params.chainId, params.tokenAddress),
                tokenDetailsService.getTokenName(params.chainId, params.tokenAddress),
                tokenDetailsService.getTokenDecimals(params.chainId, params.tokenAddress),
                tokenDetailsService.getTokenLogo(params.chainId, params.tokenAddress)
            ]);

            return {
                address: params.tokenAddress,
                chainId: params.chainId,
                decimals: decimalsRes.decimals,
                extensions: {},
                logoURI: logoRes.logo || '',
                name: nameRes.name,
                symbol: symbolRes.symbol,
                tags: [],
                price: '123.45' // Placeholder until backend integration
            };
        },
        enabled: !!params.chainId && !!params.tokenAddress,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5
    });

    return {
        isLoading: result.isLoading,
        error: result.error || null,
        data: result.data
    };
};