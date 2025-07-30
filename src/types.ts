export interface MerchantChainConfig {
  name: string;
  address: string;
  tokens: string[]; // token symbols
}

export interface MerchantConfig {
  fiatCurrency: string;
  chains: MerchantChainConfig[];
  themePreferences?: {
    darkModeEnabled?: boolean;
    primaryColor?: 'blue' | 'red' | 'green'; // Predefined primary color options
    shadowLevel?: 'sm' | 'md' | 'lg' | 'xl'; // Predefined shadow level options
  };
}

