import { BaseApiService } from './base-service';
import type { TokenDto, SearchTokensParams, ProviderTokenDto, TokenListResponseDto, TokenInfoDto, WhitelistedTokensParams } from './types';

/**
 * Service for interacting with the 1inch Token API.
 */
export class TokenService extends BaseApiService {
    /**
     * Creates an instance of TokenService.
     * @param baseURL The base URL for the API. Defaults to `/api` which is proxied.
     */
    constructor(baseURL: string = '') {
        super(`${baseURL}/token`);
    }

    /**
     * Searches for tokens on a specific chain.
     * @param chainId The ID of the chain.
     * @param params Search parameters, including the query string.
     * @returns A list of tokens matching the search criteria.
     */
    async searchForTokens(chainId: number, params: SearchTokensParams): Promise<TokenDto[]> {
        return this.http.get<TokenDto[]>(`/v1.4/${chainId}/search`, { params }).then(res => res.data);
    }

    /**
     * Search multi-chain tokens by name or symbol.
     * @param params Search parameters.
     * @returns A list of tokens matching the search criteria.
     */
    async searchMultiChainTokens(params: SearchTokensParams): Promise<TokenDto[]> {
        return this.http.get<TokenDto[]>(`/v1.3/search`, { params }).then(res => res.data);
    }

    /**
     * Get 1inch whitelisted tokens for a specific chain.
     * @param chainId The ID of the chain.
     * @param params Optional query parameters.
     * @returns A map of token addresses to token info.
     */
    async getWhitelistedTokens(chainId: number, params?: WhitelistedTokensParams): Promise<Record<string, ProviderTokenDto>> {
        return this.http.get<Record<string, ProviderTokenDto>>(`/v1.4/${chainId}`, { params }).then(res => res.data);
    }

    /**
     * Get 1inch whitelisted tokens in a list format for a specific chain.
     * @param chainId The ID of the chain.
     * @param params Optional query parameters.
     * @returns A token list object.
     */
    async getWhitelistedTokensList(chainId: number, params?: WhitelistedTokensParams): Promise<TokenListResponseDto> {
        return this.http.get<TokenListResponseDto>(`/v1.4/${chainId}/token-list`, { params }).then(res => res.data);
    }

    /**
     * Get 1inch whitelisted multi-chain tokens info.
     * @param params Optional query parameters.
     * @returns A map of token identifiers to token info.
     */
    async getMultiChainWhitelistedTokens(params?: WhitelistedTokensParams): Promise<Record<string, unknown>> {
        return this.http.get<Record<string, unknown>>(`/v1.3/multi-chain`, { params }).then(res => res.data);
    }

    /**
     * Get 1inch whitelisted multi-chain tokens in list format.
     * @param params Optional query parameters.
     * @returns A token list object.
     */
    async getMultiChainWhitelistedTokensList(params?: WhitelistedTokensParams): Promise<TokenListResponseDto> {
        return this.http.get<TokenListResponseDto>(`/v1.3/multi-chain/token-list`, { params }).then(res => res.data);
    }

    /**
     * Get all supported chain ids.
     * @returns A list of supported chain IDs.
     */
    async getSupportedChains(): Promise<Array<number>> {
        return this.http.get(`/v1.3/multi-chain/supported-chains`).then(res => res.data);
    }

    /**
     * Get single token info by address.
     * @param chainId The ID of the chain.
     * @param address The token address.
     * @returns Token information.
     */
    async getCustomToken(chainId: number, address: string): Promise<TokenDto> {
        return this.http.get<TokenDto>(`/v1.4/${chainId}/custom/${address}`).then(res => res.data);
    }

    /**
     * Get info for multiple tokens by addresses.
     * @param chainId The ID of the chain.
     * @param addresses A list of token addresses.
     * @returns A map of token addresses to token info.
     */
    async getCustomTokens(chainId: number, addresses: string[]): Promise<Record<string, TokenInfoDto>> {
        const params = new URLSearchParams();
        addresses.forEach(address => params.append('addresses', address));
        return this.http.get<Record<string, TokenInfoDto>>(`/${chainId}/custom`, { params }).then(res => res.data);
    }
}
