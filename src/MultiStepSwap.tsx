import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link } from 'react-router-dom'; // Import Link
import type { SwapParams } from './SwapParamSafe';
import WalletDeeplinkQRs from './features/wallet-deeplink/WalletDeeplinkQRs';
import { ConnectWallet } from './components/ConnectWallet'; // Import ConnectWallet
import { SelectBlockchain } from './components/SelectBlockchain'; // Import SelectBlockchain
import { SelectToken } from './components/SelectToken'; // Import SelectToken
import {  type TokenInfo } from './data/tokens'; // Import tokenData

interface MultiStepSwapProps {
  swapParams: SwapParams;
}

const MultiStepSwap = ({ swapParams }: MultiStepSwapProps) => {
  const [step, setStep] = useState(1);
  const { isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Token selection state for the source of the swap
  const [sourceChain, setSourceChain] = useState<string | null>(null);
  const [sourceToken, setSourceToken] = useState<TokenInfo | null>(null);
  const [sourceAmount, setSourceAmount] = useState('');
  const [showQRs, setShowQRs] = useState(false);

  // Available tokens (from local data, filtered by selectedChain)
  // const availableTokens = useMemo(() => {
  //   const currentChain = blockchainData.find(c => c.name === sourceChain);
  //   return tokenData.filter(token => token.chainId === currentChain?.chainId);
  // }, [sourceChain]);
  
  // Available chains from blockchain data
  // const availableChains = useMemo(() => blockchainData.map(chain => chain.name), []);

  // Use prefilled values from swapParams.dst[0]
  const destinationInfo = swapParams.dst[0];
  
  // Effect to update internal state based on connection status
  useEffect(() => {
    if (isConnected) setStep(2);
    else setStep(1);
  }, [isConnected]);

  // Effect to set sourceChain if a wallet is connected and its chain is known
  useEffect(() => {
    if (isConnected && chain) {
      setSourceChain(chain.name);
    }
  }, [isConnected, chain]);


  if (showQRs && sourceChain && sourceToken && destinationInfo) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg shadow-dynamic p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Complete Payment</h2>
        <WalletDeeplinkQRs
          blockchainName={sourceChain}
          tokenSymbol={sourceToken.symbol}
          amount={sourceAmount}
          recipientAddress={destinationInfo.destinationAddress}
          fiatAmount={0} // Fiat amount is not relevant for direct crypto payments via deeplink here
          fiatCurrency="USD" // Default to USD
        />
        <button onClick={() => setShowQRs(false)} className="mt-4 text-gray-500 hover:underline">← Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      {step < 4 && (
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Swap to Pay</h2>
          {/* Link back to create order page */}
          <Link to="/create-order" className="text-sm text-gray-500 hover:underline">Cancel</Link>
        </div>
      )}

      {step === 1 && swapParams.dst.length === 1 && <ConnectWallet />}
      
      {step === 2 && isConnected && (
        <SelectBlockchain
          selectedChain={sourceChain}
          onSelect={(chainName) => {
            setSourceChain(chainName);
            setStep(3);
          }}
          onBack={() => setStep(1)}
          onDisconnect={disconnect}
        />
      )}
      
      {step === 3 && isConnected && sourceChain && destinationInfo && (
        <SelectToken
          selectedChain={sourceChain}
          selectedToken={sourceToken}
          onSelect={setSourceToken}
          amount={sourceAmount}
          onAmountChange={setSourceAmount}
          destinationAddress={destinationInfo.destinationAddress}
          onBack={() => setStep(2)}
          onGenerateQRs={() => setShowQRs(true)}
        />
      )}
    </div>
  );
};

export default MultiStepSwap;
