export interface BlockchainTheme {
  bg: string;
  border: string;
  text: string;
  label: string;
  button: string;
  secondaryButton: string;
}

declare const blockchainData: Array<{
  id: string;
  name: string;
  chainId: number | null;
  networkId: number;
  icon: string;
  isEVM: boolean;
  walletFormat: string;
  theme?: BlockchainTheme;
}>;

export declare const defaultTheme: BlockchainTheme;

export default blockchainData;
