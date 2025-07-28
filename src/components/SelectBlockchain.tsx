import { blockchainData } from '../data/blockchains';

interface SelectBlockchainProps {
  onSelect: (chain: string) => void;
  onBack: () => void;
  onDisconnect: () => void;
  selectedChain: string | null;
}

export const SelectBlockchain = ({ onSelect, onBack, onDisconnect, selectedChain }: SelectBlockchainProps) => {
  const availableChains = blockchainData.map(chain => chain.name);

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Blockchain</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableChains.map((chain) => (
          <div
            key={chain}
            onClick={() => onSelect(chain)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedChain === chain
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <div className="flex items-center">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {chain.charAt(0)}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{chain}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          Back
        </button>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};
