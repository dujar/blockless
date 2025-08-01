import type { MerchantChainConfig } from '../../types';
import type { TokenInfoDto } from '../../services/types';

// Simplified token info for URL serialization to reduce payload size
export interface SerializableTokenDetails {
  symbol: string;
  address: string; // 'native' for native token, otherwise contract address
  decimals: number;
  chainId: number;
}

// Simplified chain config for URL serialization
export interface SerializableOrderChainConfig extends Omit<MerchantChainConfig, 'tokens'> {
  tokens: {
    symbol: string;
    amount: string;
    // Embed minimal token info for rehydration
    info: SerializableTokenDetails;
  }[];
}

// Full order data that gets serialized and deserialized
export interface SerializedOrderData {
  fiatAmount: number;
  fiatCurrency: string;
  chains: SerializableOrderChainConfig[];
}

// Rehydrated OrderData, similar to what useCreateOrderForm returns
export interface RehydratedOrderData {
  fiatAmount: number;
  fiatCurrency: string;
  chains: {
    name: string;
    address: string;
    tokens: { symbol: string; amount: string; info: TokenInfoDto }[];
  }[];
  crossChainUrl: string; // This will be regenerated on the client side
}

