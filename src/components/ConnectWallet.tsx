import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const ConnectWallet = () => {
  const { connect } = useConnect();

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Wallet</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        Connect your wallet to get started with Blockless Swap
      </p>
      <button
        onClick={() => connect({ connector: injected() })}
        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
      >
        Connect Wallet
      </button>
    </div>
  );
};
