interface ConnectWalletProps {
  onConnect: () => void;
}

export const ConnectWallet = ({ onConnect }: ConnectWalletProps) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Wallet</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-8">
      Connect your wallet to get started with Blockless Swap
    </p>
    <button
      onClick={onConnect}
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition"
    >
      Connect Wallet
    </button>
    <button
      onClick={() => window.location.href = window.location.origin + window.location.pathname}
      className="mt-4 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
    >
      ← Back to Create Swap Order
    </button>
  </div>
);
