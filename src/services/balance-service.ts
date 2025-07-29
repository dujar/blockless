import { BaseApiService } from './base-service';
import type { WalletBalance, CustomTokensRequest, CustomTokensAndWalletsRequest, AggregatedBalancesAndAllowancesResponse } from './types';

/**
 * Service for interacting with the 1inch Balance API.
 */
export class BalanceService extends BaseApiService {
    /**
     * Creates an instance of BalanceService.
     * @param baseURL The base URL for the API. Defaults to `/api` which is proxied.
     */
    constructor(baseURL: string = '/api') {
        super(`${baseURL}/balance/v1.2`);
    }

    /**
     * Fetches the token balances for a given wallet address on a specific chain.
     * @param chainId The ID of the chain.
     * @param walletAddress The address of the wallet.
     * @returns A record of token addresses to their balances.
     */
    async getWalletBalances(chainId: number, walletAddress: string): Promise<WalletBalance> {
        return this.http.get<WalletBalance>(`/${chainId}/balances/${walletAddress}`).then(res => res.data);
    }

    /**
     * Get balances of custom tokens for walletAddress.
     * @param chainId The ID of the chain.
     * @param walletAddress The address of the wallet.
     * @param body Request body with token addresses.
     * @returns A record of token addresses to their balances.
     */
    async getCustomWalletBalances(chainId: number, walletAddress: string, body: CustomTokensRequest): Promise<WalletBalance> {
        return this.http.post<WalletBalance>(`/${chainId}/balances/${walletAddress}`, body).then(res => res.data);
    }

    /**
     * Get balances of custom tokens for list of wallets addresses.
     * @param chainId The ID of the chain.
     * @param body Request body with token and wallet addresses.
     * @returns A map of wallet addresses to their token balances.
     */
    async getBalancesByMultipleWallets(chainId: number, body: CustomTokensAndWalletsRequest): Promise<Record<string, WalletBalance>> {
        return this.http.post<Record<string, WalletBalance>>(`/${chainId}/balances/multiple/walletsAndTokens`, body).then(res => res.data);
    }

    /**
     * Get allowances of tokens by spender for walletAddress.
     * @param chainId The ID of the chain.
     * @param spender The spender address.
     * @param walletAddress The wallet address.
     * @returns A record of token addresses to their allowances.
     */
    async getAllowances(chainId: number, spender: string, walletAddress: string): Promise<Record<string, string>> {
        return this.http.get<Record<string, string>>(`/${chainId}/allowances/${spender}/${walletAddress}`).then(res => res.data);
    }

    /**
     * Get allowances of custom tokens by spender for walletAddress.
     * @param chainId The ID of the chain.
     * @param spender The spender address.
     * @param walletAddress The wallet address.
     * @param body Request body with token addresses.
     * @returns A record of token addresses to their allowances.
     */
    async getCustomAllowances(chainId: number, spender: string, walletAddress: string, body: CustomTokensRequest): Promise<Record<string, string>> {
        return this.http.post<Record<string, string>>(`/${chainId}/allowances/${spender}/${walletAddress}`, body).then(res => res.data);
    }

    /**
     * Get balances and allowances of tokens by spender for walletAddress.
     * @param chainId The ID of the chain.
     * @param spender The spender address.
     * @param walletAddress The wallet address.
     * @returns A record of token addresses to their balance and allowance.
     */
    async getAllowancesAndBalances(chainId: number, spender: string, walletAddress: string): Promise<Record<string, { balance: string; allowance: string }>> {
        return this.http.get<Record<string, { balance: string; allowance: string }>>(`/${chainId}/allowancesAndBalances/${spender}/${walletAddress}`).then(res => res.data);
    }

    /**
     * Get balances and allowances of custom tokens by spender for walletAddress.
     * @param chainId The ID of the chain.
     * @param spender The spender address.
     * @param walletAddress The wallet address.
     * @param body Request body with token addresses.
     * @returns A record of token addresses to their balance and allowance.
     */
    async getCustomAllowancesAndBalances(chainId: number, spender: string, walletAddress: string, body: CustomTokensRequest): Promise<Record<string, { balance: string; allowance: string }>> {
        return this.http.post<Record<string, { balance: string; allowance: string }>>(`/${chainId}/allowancesAndBalances/${spender}/${walletAddress}`, body).then(res => res.data);
    }

    /**
     * Get balances and allowances by spender for list of wallets addresses.
     * @param chainId The ID of the chain.
     * @param spender The spender address.
     * @param wallets List of wallet addresses.
     * @param filterEmpty Filter out empty balances and allowances.
     * @returns Aggregated balances and allowances by tokens.
     */
    async getAggregatedBalancesAndAllowances(chainId: number, spender: string, wallets: string[], filterEmpty?: boolean): Promise<AggregatedBalancesAndAllowancesResponse[]> {
        const params = new URLSearchParams();
        wallets.forEach(wallet => params.append('wallets', wallet));
        if (filterEmpty !== undefined) {
            params.append('filterEmpty', String(filterEmpty));
        }
        return this.http.get<AggregatedBalancesAndAllowancesResponse[]>(`/${chainId}/aggregatedBalancesAndAllowances/${spender}`, { params }).then(res => res.data);
    }
}
