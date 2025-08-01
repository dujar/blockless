import { BaseApiService } from './base-service';
// import type {
//   CurrenciesResponseDto,
//   GetPricesRequestDto,
//   PricesResponse
// } from './types';

/**
 * Defines the supported currency codes for spot price lookups.
 * These are based on the enum values found in the `api_knowledge/spot.json` OpenAPI spec.
 */
export enum SpotCurrency {
  USD = 'USD',
  AED = 'AED',
  ARS = 'ARS',
  AUD = 'AUD',
  BDT = 'BDT',
  BHD = 'BHD',
  BMD = 'BMD',
  BRL = 'BRL',
  CAD = 'CAD',
  CHF = 'CHF',
  CLP = 'CLP',
  CNY = 'CNY',
  CZK = 'CZK',
  DKK = 'DKK',
  EUR = 'EUR',
  GBP = 'GBP',
  HKD = 'HKD',
  HUF = 'HUF',
  IDR = 'IDR',
  ILS = 'ILS',
  INR = 'INR',
  JPY = 'JPY',
  KRW = 'KRW',
  KWD = 'KWD',
  LKR = 'LKR',
  MMK = 'MMK',
  MXN = 'MXN',
  MYR = 'MYR',
  NGN = 'NGN',
  NOK = 'NOK',
  NZD = 'NZD',
  PHP = 'PHP',
  PKR = 'PKR',
  PLN = 'PLN',
  RUB = 'RUB',
  SAR = 'SAR',
  SEK = 'SEK',
  SGD = 'SGD',
  THB = 'THB',
  TRY = 'TRY',
  TWD = 'TWD',
  UAH = 'UAH',
  VEF = 'VEF',
  VND = 'VND',
  ZAR = 'ZAR',
}

/**
 * Represents the response structure for token prices.
 * Keys are token addresses (e.g., "0xeeee..."), and values are their prices as strings (in Wei or specified currency).
 */
export type PricesResponse = {
  [address: string]: string;
};

/**
 * Represents the response structure for the list of custom currencies.
 */
export type CurrenciesResponseDto = {
  codes: string[];
};

/**
 * Represents the request body for fetching prices via a POST request.
 */
export type GetPricesRequestDto = {
  tokens: string[];
  currency?: SpotCurrency;
};

/**
 * Service class for interacting with the 1inch Spot Price API.
 * Provides methods to fetch token prices and supported currencies for various blockchain networks.
 */
export class SpotPriceService extends BaseApiService {
  /**
   * Creates an instance of SpotPriceService.
   * The base URL for the 1inch Spot Price API is `/api/v1.1`, which is handled by the BaseApiService.
   */
  constructor() {
    super('/v1.1');
  }

  /**
   * Fetches prices for whitelisted tokens on a given blockchain network.
   * This corresponds to the GET `/v1.1/{chainId}` endpoint.
   * @param chainId The ID of the blockchain network (e.g., 43114 for Avalanche).
   * @param currency Optional currency to get prices in (e.g., SpotCurrency.USD). If not provided, price is returned in native Wei.
   * @returns A promise that resolves to an object where keys are token addresses and values are their prices.
   */
  public async getWhitelistedPrices(
    chainId: number,
    currency?: SpotCurrency
  ): Promise<PricesResponse> {
    return this.http.get<PricesResponse>(
      `/${chainId}`,
      {
        params: { currency },
      }
    ).then(res => res.data);
  }

  /**
   * Fetches prices for specific tokens by their addresses on a given blockchain network using a GET request.
   * This corresponds to the GET `/v1.1/{chainId}/{addresses}` endpoint.
   * This method is suitable for fetching prices for a moderate number of tokens where addresses can be passed as a comma-separated path parameter.
   * @param chainId The ID of the blockchain network.
   * @param addresses An array of token addresses (e.g., ["0x...", "0x..."]) to fetch prices for.
   * @param currency Optional currency to get prices in. If not provided, price is returned in native Wei.
   * @returns A promise that resolves to an object where keys are token addresses and values are their prices.
   */
  public async getPricesByAddresses(
    chainId: number,
    addresses: string[],
    currency?: SpotCurrency
  ): Promise<PricesResponse> {
    if (addresses.length === 0) {
      return {}; // Return an empty object if no addresses are provided to avoid unnecessary API calls.
    }
    const addressesParam = addresses.join(',');
    return this.http.get<PricesResponse>(
      `/${chainId}/${addressesParam}`,
      {
        params: { currency },
      }
    ).then(res => res.data);
  }

  /**
   * Fetches prices for specific tokens by their addresses on a given blockchain network using a POST request.
   * This corresponds to the POST `/v1.1/{chainId}` endpoint.
   * This method is more suitable for a potentially large number of token addresses as they are sent in the request body.
   * @param chainId The ID of the blockchain network.
   * @param tokens An array of token addresses (e.g., ["0x...", "0x..."]) to fetch prices for.
   * @param currency Optional currency to get prices in. If not provided, price is returned in native Wei.
   * @returns A promise that resolves to an object where keys are token addresses and values are their prices.
   */
  public async postPricesByAddresses(
    chainId: number,
    tokens: string[],
    currency?: SpotCurrency
  ): Promise<PricesResponse> {
    const requestBody: GetPricesRequestDto = { tokens, currency };
    return this.http.post<PricesResponse>(
      `/${chainId}`,
      requestBody
    ).then(res => res.data);
  }

  /**
   * Fetches a list of custom currencies supported by the API for a given blockchain network.
   * This corresponds to the GET `/v1.1/{chainId}/currencies` endpoint.
   * @param chainId The ID of the blockchain network.
   * @returns A promise that resolves to an object containing an array of currency codes (e.g., ["USD", "EUR"]).
   */
  public async getCustomCurrencies(
    chainId: number
  ): Promise<CurrenciesResponseDto> {
    return this.http.get<CurrenciesResponseDto>(
      `/${chainId}/currencies`
    ).then(res => res.data);
  }
}

/**
 * Exports a singleton instance of the `SpotPriceService` for convenient use throughout the application.
 */
export const spotPriceService = new SpotPriceService();

