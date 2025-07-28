import { useState, useEffect, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { config } from './wagmi';
import {blockchainData} from './data/blockchains';
import type { SwapParams } from './SwapParamSafe';

interface MultiStepSwapProps {
  swapParams: SwapParams;
}

interface Token {
  symbol: string;
  name: string;
  chain: string;
  iconUrl?: string;
}

const MultiStepSwap = ({ swapParams }: MultiStepSwapProps) => {
  const [step, setStep] = useState(1);
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Token selection state
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [amount, setAmount] = useState(swapParams.dst.amount || '');
  
  // Available tokens (mock data)
  const availableTokens: Token[] = useMemo(() => [
    { symbol: 'ETH', name: 'Ether', chain: 'Ethereum', iconUrl: '/eth.svg' },
    { symbol: 'BNB', name: 'BNB', chain: 'BNB Chain', iconUrl: '/bnb.svg' },
    { symbol: 'MATIC', name: 'Polygon', chain: 'Polygon', iconUrl: '/matic.svg' },
    { symbol: 'USDC', name: 'USD Coin', chain: 'Ethereum', iconUrl: '/usdc.svg' },
  ], []);
  
  // Available chains from blockchain data
  const availableChains = blockchainData.map(chain => chain.name);

  // Use prefilled values when they change
  useEffect(() => {
    if (swapParams.dst.blockchain) {
      setSelectedChain(swapParams.dst.blockchain);
    }
    if (swapParams.dst.amount) {
      setAmount(swapParams.dst.amount);
    }
    if (swapParams.dst.token.symbol) {
      // Find the token in available tokens
      const token = availableTokens.find(t => t.symbol === swapParams.dst.token.symbol);
      if (token) {
        setSelectedToken(token);
      }
    }
  }, [swapParams, availableTokens]);

  const handleConnectWallet = () => {
    connect({ connector: config.connectors[0] });
    setStep(2);
  };


  const handleSwap = () => {
    // In a real implementation, this would call the swap function
    console.log('Swapping', amount, selectedToken, 'to target address:', swapParams.dst.destinationAddress || 'user wallet');
    alert(`Swapping ${amount} ${selectedToken?.symbol} on ${selectedChain} ${(swapParams.dst.destinationAddress ? `to ${swapParams.dst.destinationAddress}` : 'to your wallet')}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= stepNum 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {stepNum}
            </div>
            <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {stepNum === 1 && 'Connect'}
              {stepNum === 2 && 'Blockchain'}
              {stepNum === 3 && 'Token'}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Connect Wallet */}
      {step === 1 && (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Connect your wallet to get started with Blockless Swap
          </p>
          <button
            onClick={handleConnectWallet}
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
      )}

      {/* Step 2: Select Blockchain */}
      {step === 2 && isConnected && (
        <div className="py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Blockchain</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChains.map((chain) => (
              <div
                key={chain}
                onClick={() => {
                  setSelectedChain(chain);
                  setStep(3);
                }}
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
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Token and Amount */}
      {step === 3 && isConnected && selectedChain && (
        <div className="py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Token</h2>
          
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.0"
            />
          </div>
          
          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Token
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableTokens
                .filter(token => token.chain === selectedChain)
                .map((token) => (
                  <div
                    key={token.symbol}
                    onClick={() => setSelectedToken(token)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                      selectedToken?.symbol === token.symbol
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
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
          {swapParams.dst.destinationAddress && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Address
              </label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-sm break-all text-gray-900 dark:text-white">
                  {swapParams.dst.destinationAddress}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={handleSwap}
              disabled={!selectedToken || !amount || parseFloat(amount) <= 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                !selectedToken || !amount || parseFloat(amount) <= 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepSwap;