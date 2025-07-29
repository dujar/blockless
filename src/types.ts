export interface MerchantChainConfig {
  name: string;
  address: string;
  tokens: string[]; // token symbols
}

export interface MerchantConfig {
  fiatCurrency: string;
  chains: MerchantChainConfig[];
}
