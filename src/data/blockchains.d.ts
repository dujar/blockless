declare const blockchainData: Array<{
  id: string;
  name: string;
  chainId: number | null;
  networkId: number,
  icon: string;
  isEVM: boolean;
  walletFormat: string;
}>;

export default blockchainData;