import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { parseSwapParamsSafe, type SwapInfo, type SwapParams } from '../SwapParamSafe';
import { ConnectWallet } from '../components/ConnectWallet';
import { SelectBlockchain } from '../components/SelectBlockchain';
import { SelectToken } from '../components/SelectToken';
import WalletDeeplinkQRs from '../features/wallet-deeplink/WalletDeeplinkQRs';
import { type TokenInfo } from '../data/tokens';

const SwapPage = () => {
  const [searchParams] = useSearchParams();
  const [swapParams, setSwapParams] = useState<SwapParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<SwapInfo | null>(null);

  const [step, setStep] = useState(1);
  const { isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [sourceChain, setSourceChain] = useState<string | null>(null);
  const [sourceToken, setSourceToken] = useState<TokenInfo | null>(null);
  const [sourceAmount, setSourceAmount] = useState('');
  const [showQRs, setShowQRs] = useState(false);

  useEffect(() => {
    const result = parseSwapParamsSafe(searchParams);
    if (result.success && result.data) {
      setSwapParams(result.data);
      if (result.data.dst.length === 1) {
        setSelectedDestination(result.data.dst[0]);
      }
    } else {
      setError(result.error ?? 'Invalid swap parameters provided.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isConnected) setStep(2);
    else setStep(1);
  }, [isConnected]);

  useEffect(() => {
    if (chain) {
      setSourceChain(chain.name);
    }
  }, [chain]);

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!swapParams) {
    return <div>Loading swap details...</div>;
  }

  if (!selectedDestination) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Payment Destination</h2>
        <div className="space-y-3">
          {swapParams.dst.map((dst, index) => (
            <div
              key={index}
              onClick={() => setSelectedDestination(dst)}
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 cursor-pointer transition"
            >
              Pay <span className="font-bold">{dst.amount} {dst.token.symbol}</span> on <span className="font-semibold">{dst.blockchain}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showQRs && sourceChain && sourceToken) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Complete Payment</h2>
        <WalletDeeplinkQRs
          blockchainName={sourceChain}
          tokenSymbol={sourceToken.symbol}
          amount={sourceAmount}
          recipientAddress={selectedDestination.destinationAddress}
          fiatAmount={0} // Dummy value
          fiatCurrency="USD" // Dummy value
        />
        <button onClick={() => setShowQRs(false)} className="mt-4 text-blue-500 hover:underline">← Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      {step < 4 && (
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Swap to Pay</h2>
          <Link to="/create-order" className="text-sm text-blue-500 hover:underline">Cancel</Link>
        </div>
      )}

      {step === 1 && <ConnectWallet onConnect={() => connect({ connector: connectors[0] })} />}
      
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
      
      {step === 3 && isConnected && sourceChain && (
        <SelectToken
          selectedChain={sourceChain}
          selectedToken={sourceToken}
          onSelect={setSourceToken}
          amount={sourceAmount}
          onAmountChange={setSourceAmount}
          destinationAddress={selectedDestination.destinationAddress}
          onBack={() => setStep(2)}
          onGenerateQRs={() => setShowQRs(true)}
        />
      )}
    </div>
  );
};

export default SwapPage;
