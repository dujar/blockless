import { BaseApiService } from './base-service';
import type { TokenRiskResponse, TokenLogoResponse, TokenNameResponse, TokenSymbolResponse, TokenDecimalsResponse } from './types';

/**
 * Service for interacting with the 1inch Token Details API.
 * This API provides specific details about tokens, like risks and safelists.
 */
export class TokenDetailsService extends BaseApiService {
    /**
     * Creates an instance of TokenDetailsService.
     * @param baseURL The base URL for the API. Defaults to `/api` which is proxied.
     */
    constructor(baseURL: string = '') {
        super(`${baseURL}/token-details/v1.1`);
    }

    /**
     * Check if a token is in the 1inch safelist.
     * @param chainId The ID of the chain.
     * @param tokenAddress The address of the token.
     * @returns A boolean indicating if the token is in the safelist.
     */
    async isTokenInSafelist(chainId: number, tokenAddress: string): Promise<boolean> {
        return this.http.get<boolean>(`/${chainId}/${tokenAddress}/safelist`).then(res => res.data);
    }

    /**
     * Get risks for a single token.
     * @param chainId The ID of the chain.
     * @param tokenAddress The address of the token.
     * @returns The risks associated with the token.
     */
    async getTokenRisks(chainId: number, tokenAddress: string): Promise<TokenRiskResponse> {
        return this.http.get<TokenRiskResponse>(`/${chainId}/${tokenAddress}/risks`).then(res => res.data);
    }

    /**
     * Get risks for multiple tokens.
     * @param chainId The ID of the chain.
     * @param addresses A list of token addresses.
     * @returns A map of token addresses to their risks.
     */
    async getMultipleTokensRisks(chainId: number, addresses: string[]): Promise<Record<string, TokenRiskResponse>> {
        const params = new URLSearchParams();
        addresses.forEach(address => params.append('addresses', address));
        return this.http.get<Record<string, TokenRiskResponse>>(`/${chainId}/risks`, { params }).then(res => res.data);
    }

    /**
     * Get logo for a single token.
     * @param chainId The ID of the chain.
     * @param tokenAddress The address of the token.
     * @returns The logo URL of the token.
     */
    async getTokenLogo(chainId: number, tokenAddress: string): Promise<TokenLogoResponse> {
        return this.http.get<TokenLogoResponse>(`/${chainId}/${tokenAddress}/logo`).then(res => res.data);
    }

    /**
     * Get logos for multiple tokens.
     * @param chainId The ID of the chain.
     * @param addresses A list of token addresses.
     * @returns A map of token addresses to their logo URLs.
     */
    async getMultipleTokensLogo(chainId: number, addresses: string[]): Promise<Record<string, TokenLogoResponse>> {
        const params = new URLSearchParams();
        addresses.forEach(address => params.append('addresses', address));
        return this.http.get<Record<string, TokenLogoResponse>>(`/${chainId}/logo`, { params }).then(res => res.data);
    }

    /**
     * Get name for a single token.
     * @param chainId The ID of the chain.
     * @param tokenAddress The address of the token.
     * @returns The name of the token.
     */
    async getTokenName(chainId: number, tokenAddress: string): Promise<TokenNameResponse> {
        return this.http.get<TokenNameResponse>(`/${chainId}/${tokenAddress}/name`).then(res => res.data);
    }

    /**
     * Get names for multiple tokens.
     * @param chainId The ID of the chain.
     * @param addresses A list of token addresses.
     * @returns A map of token addresses to their names.
     */
    async getMultipleTokensName(chainId: number, addresses: string[]): Promise<Record<string, TokenNameResponse>> {
        const params = new URLSearchParams();
        addresses.forEach(address => params.append('addresses', address));
        return this.http.get<Record<string, TokenNameResponse>>(`/${chainId}/name`, { params }).then(res => res.data);
    }

    /**
     * Get symbol for a single token.
     * @param chainId The ID of the chain.
     * @param tokenAddress The address of the token.
     * @returns The symbol of the token.
     */
    async getTokenSymbol(chainId: number, tokenAddress: string): Promise<TokenSymbolResponse> {
        return this.http.get<TokenSymbolResponse>(`/${chainId}/${tokenAddress}/symbol`).then(res => res.data);
    }

    /**
     * Get symbols for multiple tokens.
     * @param chainId The ID of the chain.
     * @param addresses A list of token addresses.
     * @returns A map of token addresses to their symbols.
     */
    async getMultipleTokensSymbol(chainId: number, addresses: string[]): Promise<Record<string, TokenSymbolResponse>> {
        const params = new URLSearchParams();
        addresses.forEach(address => params.append('addresses', address));
        return this.http.get<Record<string, TokenSymbolResponse>>(`/${chainId}/symbol`, { params }).then(res => res.data);
    }

    /**
     * Get decimals for a single token.
     * @param chainId The ID of the chain.
     * @param tokenAddress The address of the token.
     * @returns The decimals of the token.
     */
    async getTokenDecimals(chainId: number, tokenAddress: string): Promise<TokenDecimalsResponse> {
        return this.http.get<TokenDecimalsResponse>(`/${chainId}/${tokenAddress}/decimals`).then(res => res.data);
    }

    /**
     * Get decimals for multiple tokens.
     * @param chainId The ID of the chain.
     * @param addresses A list of token addresses.
     * @returns A map of token addresses to their decimals.
     */
    async getMultipleTokensDecimals(chainId: number, addresses: string[]): Promise<Record<string, TokenDecimalsResponse>> {
        const params = new URLSearchParams();
        addresses.forEach(address => params.append('addresses', address));
        return this.http.get<Record<string, TokenDecimalsResponse>>(`/${chainId}/decimals`, { params }).then(res => res.data);
    }
}
