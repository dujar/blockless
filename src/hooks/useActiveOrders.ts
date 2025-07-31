import { useQuery } from '@tanstack/react-query';
import { OrderService } from '../services/fusion-service';
import type { GetActiveOrdersParams } from '../services/types';

/**
 * Hook to fetch active cross-chain orders from the 1inch Fusion+ API.
 * @param params Query parameters for pagination and filtering.
 * @returns Active orders and their fill status.
 */
export function useActiveOrders(params?: GetActiveOrdersParams) {
    const queryKey = ['active-orders', params];
    
    const queryFn = async () => {
        const service = new OrderService();
        return await service.getActiveOrders(params);
    };

    return useQuery({
        queryKey,
        queryFn,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}
