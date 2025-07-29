import { BaseApiService } from './base-service';
import type {
    // Quoter
    GetQuoteParams,
    GetQuoteOutput,
    CustomPresetParams,
    BuildOrderParams,
    BuildOrderBody,
    BuildOrderOutput,

    // Order
    GetActiveOrdersParams,
    GetActiveOrdersOutput,
    GetOrdersByMakerParams,
    GetOrderByMakerOutput,
    GetOrderFillsByHashOutput,
    OrdersByHashesInput,
    ResolverDataOutput,
    EscrowFactory,
    ReadyToAcceptSecretFills,
    ReadyToAcceptSecretFillsForAllOrders,
    ReadyToExecutePublicActionsOutput,

    // Relayer
    SignedOrderInput,
    SecretInput
} from './types';

/**
 * Service for interacting with the 1inch Fusion+ Quoter API.
 */
export class QuoterService extends BaseApiService {
    constructor(baseURL: string = '/api') {
        super(`${baseURL}/quoter/v1.0`);
    }

    /**
     * Get quote details based on input data.
     * @param params The parameters for the quote.
     * @returns The quote.
     */
    async getQuote(params: GetQuoteParams): Promise<GetQuoteOutput> {
        return this.http.get<GetQuoteOutput>('/quote/receive', { params }).then(res => res.data);
    }

    /**
     * Get quote with custom preset details.
     * @param params The parameters for the quote.
     * @param body The custom preset parameters.
     * @returns The quote with custom presets.
     */
    async getQuoteWithCustomPresets(params: GetQuoteParams, body: CustomPresetParams): Promise<GetQuoteOutput> {
        return this.http.post<GetQuoteOutput>('/quote/receive', body, { params }).then(res => res.data);
    }

    /**
     * Build order by given quote.
     * @param params The parameters for building the order.
     * @param body The body containing the quote and secrets hash list.
     * @returns Cross chain order details.
     */
    async buildQuoteTypedData(params: BuildOrderParams, body: BuildOrderBody): Promise<BuildOrderOutput> {
        return this.http.post<BuildOrderOutput>('/quote/build', body, { params }).then(res => res.data);
    }
}


/**
 * Service for interacting with the 1inch Fusion+ Order API.
 */
export class OrderService extends BaseApiService {
    constructor(baseURL: string = '/api') {
        super(`${baseURL}/orders/v1.0`);
    }

    /**
     * Get cross chain swap active orders.
     * @param params Query parameters for pagination and filtering.
     * @returns Array of queried active orders.
     */
    async getActiveOrders(params?: GetActiveOrdersParams): Promise<GetActiveOrdersOutput> {
        return this.http.get<GetActiveOrdersOutput>('/order/active', { params }).then(res => res.data);
    }

    /**
     * Get actual escrow factory contract address.
     * @param chainId Optional chain ID.
     * @returns The escrow factory contract address.
     */
    async getSettlementContract(chainId?: number): Promise<EscrowFactory> {
        return this.http.get<EscrowFactory>('/order/escrow', { params: { chainId } }).then(res => res.data);
    }

    /**
     * Get orders by maker address.
     * @param address Maker's address.
     * @param params Query parameters for pagination and filtering.
     * @returns A list of orders.
     */
    async getOrdersByMaker(address: string, params?: GetOrdersByMakerParams): Promise<GetOrderByMakerOutput> {
        return this.http.get<GetOrderByMakerOutput>(`/order/maker/${address}`, { params }).then(res => res.data);
    }

    /**
     * Get all data to perform withdrawal and cancellation.
     * @param orderHash The order hash.
     * @returns Public secrets and all data related to withdrawal and cancellation.
     */
    async getPublishedSecrets(orderHash: string): Promise<ResolverDataOutput> {
        return this.http.get<ResolverDataOutput>(`/order/secrets/${orderHash}`).then(res => res.data);
    }
    
    /**
     * Get idx of each secret that is ready for submission for a specific order.
     * @param orderHash The order hash.
     * @returns Fills that are ready to accept secrets.
     */
    async getReadyToAcceptSecretFills(orderHash: string): Promise<ReadyToAcceptSecretFills> {
        return this.http.get<ReadyToAcceptSecretFills>(`/order/ready-to-accept-secret-fills/${orderHash}`).then(res => res.data);
    }
    
    /**
     * Get idx of each secret that is ready for submission for all orders.
     * @returns Fills that are ready to accept secrets for all orders.
     */
    async getReadyToAcceptSecretFillsForAllOrders(): Promise<ReadyToAcceptSecretFillsForAllOrders> {
        return this.http.get<ReadyToAcceptSecretFillsForAllOrders>('/order/ready-to-accept-secret-fills').then(res => res.data);
    }
    
    /**
     * Get all data to perform a cancellation or withdrawal on public periods.
     * @returns Actions allowed to be performed.
     */
    async getEventsReadyForPublicAction(): Promise<ReadyToExecutePublicActionsOutput> {
        return this.http.get<ReadyToExecutePublicActionsOutput>('/order/ready-to-execute-public-actions').then(res => res.data);
    }

    /**
     * Get order by hash.
     * @param orderHash The order hash.
     * @returns Order fill status and details.
     */
    async getOrderByHash(orderHash: string): Promise<GetOrderFillsByHashOutput> {
        return this.http.get<GetOrderFillsByHashOutput>(`/order/status/${orderHash}`).then(res => res.data);
    }

    /**
     * Get orders by hashes.
     * @param body Request body with a list of order hashes.
     * @returns A list of order fill statuses and details.
     */
    async getOrdersByHashes(body: OrdersByHashesInput): Promise<GetOrderFillsByHashOutput[]> {
        return this.http.post<GetOrderFillsByHashOutput[]>('/order/status', body).then(res => res.data);
    }
}


/**
 * Service for interacting with the 1inch Fusion+ Relayer API.
 */
export class RelayerService extends BaseApiService {
    constructor(baseURL: string = '/api') {
        super(`${baseURL}/relayer/v1.0`);
    }

    /**
     * Submit a cross chain order that resolvers will be able to fill.
     * @param body The signed order input.
     */
    async submitOrder(body: SignedOrderInput): Promise<void> {
        return this.http.post('/submit', body).then(res => res.data);
    }

    /**
     * Submit many cross chain orders that resolvers will be able to fill.
     * @param body An array of signed order data strings.
     */
    async submitManyOrders(body: string[]): Promise<void> {
        return this.http.post('/submit/many', body).then(res => res.data);
    }

    /**
     * Submit a secret for order fill.
     * @param body The secret input.
     */
    async submitSecret(body: SecretInput): Promise<void> {
        return this.http.post('/submit/secret', body).then(res => res.data);
    }
}
