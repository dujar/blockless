import { tokenData, type TokenInfo } from '../data/tokens';
import { blockchainData } from '../data/blockchains';

interface SelectTokenProps {
  onSelect: (token: TokenInfo) => void;
  onBack: () => void;
  selectedToken: TokenInfo | null;
  selectedChain: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  destinationAddress: string;
  onGenerateQRs: () => void;
}

export const SelectToken = ({ 
  onSelect, 
  onBack, 
  selectedToken, 
  selectedChain, 
  amount, 
  onAmountChange, 
  destinationAddress, 
  onGenerateQRs 
}: SelectTokenProps) => {
  const chain = blockchainData.find(c => c.name === selectedChain);
  const filteredTokens = tokenData.filter(token => token.chainId === chain?.chainId);

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Token</h2>
      
      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="0.0"
        />
      </div>
      
      {/* Token Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
          Select Token
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTokens
            .map((token) => (
              <div
                key={token.symbol}
                onClick={() => onSelect(token)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                  selectedToken?.symbol === token.symbol
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex items-center">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                      {token.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{token.name}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Target Address (if provided) */}
      {destinationAddress && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
            Target Address
          </label>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-sm break-all text-gray-900 dark:text-white">
              {destinationAddress}
            </div>
          </div>
        </div>
      )}
      
      {/* Action Button */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          Back
        </button>
        <button
          onClick={onGenerateQRs}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
          disabled={!selectedToken || !amount}
        >
          Generate QR Codes
        </button>
      </div>
    </div>
  );
};
