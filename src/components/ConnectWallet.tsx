import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import type { BlockchainData } from '../data/blockchains';

interface ConnectWalletProps {
  blockchain: BlockchainData;
}

export const ConnectWallet = ({ blockchain }: ConnectWalletProps) => {
  const { connect } = useConnect();

  return (
    <div className="text-center py-8">
      <h3 className="text-xl font-bold text-base-content mb-4">Connect to {blockchain.name}</h3>
      <p className="text-base-content mb-8">
        Connect your wallet to get started with Blockless Swap on {blockchain.name}
      </p>
      <button
        onClick={() => connect({ connector: injected() })}
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
      >
        Connect Wallet for {blockchain.name}
      </button>
    </div>
  );
};
