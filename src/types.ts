export interface MerchantChainConfig {
  name: string;
  address: string;
  tokens: string[]; // token symbols
}

export interface MerchantConfig {
  fiatCurrency: string;
  chains: MerchantChainConfig[];
  themePreferences?: {
    darkModeEnabled?: boolean; // Removed: now handled by ThemeContext
    primaryColor?: 'blue' | 'red' | 'green' | 'orange'; // Predefined primary color options
    shadowLevel?: 'sm' | 'md' | 'lg' | 'xl'; // Predefined shadow level options
  };
}
