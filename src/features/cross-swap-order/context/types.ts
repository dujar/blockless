/**
 * Chain metadata needed for order selection display
 */
export interface Blockchain {
  chainId: number;
  name: string;
  ticker: string;
  nativeCurrency: {
    symbol: string;
    name: string;
    decimals: number;
  };
  logo: string;
  explorerUrl: string;
}

/**
 * Available payment options from 1inch API
 */
export interface PaymentOption {
  chainId: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: string;
  estimatedPrice: {
    dstTokenAmount: string;
    estimatedUsdValue: number;
  };
  isNativeToken: boolean;
}
