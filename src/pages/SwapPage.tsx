import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { parseSwapParamsSafe, type SwapInfo, type SwapParams } from '../SwapParamSafe';
import { ConnectWallet } from '../components/ConnectWallet';
import { SelectBlockchain } from '../components/SelectBlockchain';
import { SelectToken } from '../components/SelectToken';
import { type TokenInfo } from '../data/tokens';
import { getTokenLogoURI, getBlockchainLogo } from '../utils/token-helpers';
import blocklessLogo from '../assets/blockless.svg';
import { useSwapForm } from '../features/swap-order/hooks/useSwapForm';
import OrderDisplay from '../features/swap-order/sections/OrderDisplay';

const SwapPage = () => {
  const [searchParams] = useSearchParams();
  const [swapParams, setSwapParams] = useState<SwapParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<SwapInfo | null>(null);
  const [step, setStep] = useState(1);
  const [showQRs, setShowQRs] = useState(false);
  const [oneInchSwapUrl, setOneInchSwapUrl] = useState<string>('');

  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    formData,
    handleInputChange,
    setSourceTokenInForm,
    handleReset,
    isFormValid,
    generateSwapQuote,
    quoteData,
    isQuoteLoading,
    quoteError,
  } = useSwapForm({ onFormReset: () => {
    setStep(1);
    setShowQRs(false);
    setSelectedDestination(null);
    const result = parseSwapParamsSafe(searchParams);
    if (result.success && result.data) {
        setSwapParams(result.data);
    }
  }});

  useEffect(() => {
    const result = parseSwapParamsSafe(searchParams);
    if (result.success && result.data) {
      setSwapParams(result.data);
      if (result.data.dst.length === 1) {
        setSelectedDestination(result.data.dst[0]);
      } else if (result.data.dst.length === 0) {
        setError('No destination parameters provided.');
      }
    } else {
      setError(result.error ?? 'Invalid swap parameters provided.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isConnected) {
      if (selectedDestination) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else {
      setStep(1);
    }
  }, [isConnected, selectedDestination]);

  useEffect(() => {
    if (selectedDestination && formData.targetAddress.toLowerCase() !== selectedDestination.destinationAddress.toLowerCase()) {
        handleInputChange({
            target: { name: 'targetAddress', value: selectedDestination.destinationAddress },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }, [selectedDestination, formData.targetAddress, handleInputChange]);

  const handleConnectWallet = () => {
    connect({ connector: connectors[0] });
  };

  const handleGenerateQRs = async () => {
    if (selectedDestination && isFormValid()) {
      const generatedUrl = await generateSwapQuote(
        selectedDestination.blockchain,
        selectedDestination.token,
        selectedDestination.amount
      );
      if (generatedUrl) {
        setOneInchSwapUrl(generatedUrl);
        setShowQRs(true);
      }
    }
  };

  if (error && !swapParams) {
    return (
      <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-dynamic" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <div className="mt-4 text-center">
            <Link to="/create-order" className="text-primary-500 hover:underline">
              ← Back to Create Order
            </Link>
        </div>
      </div>
    );
  }

  if (!swapParams || (swapParams.dst.length > 1 && !selectedDestination)) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg shadow-dynamic p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Choose Payment Destination</h2>
        <p className="text-gray-700 dark:text-gray-400 mb-6">
            Multiple payment options are available. Please select one to proceed.
        </p>
        <div className="space-y-3">
          {swapParams?.dst.map((dst, index) => (
            <div
              key={index}
              onClick={() => setSelectedDestination(dst)}
              className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 cursor-pointer transition flex items-center space-x-4"
            >
              <img src={getBlockchainLogo(dst.blockchain) || blocklessLogo} alt={dst.blockchain} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center">
                  <img src={getTokenLogoURI(dst.token.address || '', dst.token.symbol || '', dst.blockchain)} alt={dst.token.symbol || 'Token'} className="w-6 h-6 rounded-full mr-2"/>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{dst.amount} {dst.token.symbol}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 break-all truncate">Recipient: {dst.destinationAddress}</div>
              </div>
            </div>
          ))}
        </div>
         <div className="mt-8 text-center">
            <Link to="/create-order" className="text-primary-500 hover:underline">← Back to Create Order</Link>
        </div>
      </div>
    );
  }

  if (showQRs && selectedDestination) {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Swap to Pay</h1>
            <OrderDisplay
                showQRCode={true}
                qrCodeUrl={oneInchSwapUrl}
                formData={formData}
                quoteData={quoteData}
                isQuoteLoading={isQuoteLoading}
                quoteError={quoteError}
                onBackToForm={() => setShowQRs(false)}
            />
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Swap to Pay</h2>
        <button onClick={handleReset} className="text-sm text-primary-500 hover:underline">Cancel</button>
      </div>

      {selectedDestination && (
        <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">You are paying for:</h3>
          <div className="flex items-center space-x-4">
            <img src={getBlockchainLogo(selectedDestination.blockchain) || blocklessLogo} alt={selectedDestination.blockchain} className="w-10 h-10 rounded-full"/>
            <div className="flex-1 min-w-0">
              <p className="text-primary-700 dark:text-primary-300 text-sm mb-1">On <span className="font-semibold">{selectedDestination.blockchain}</span></p>
              <div className="flex items-center">
                <img src={getTokenLogoURI(selectedDestination.token.address || '', selectedDestination.token.symbol || '', selectedDestination.blockchain)} alt={selectedDestination.token.symbol || 'Token'} className="w-6 h-6 rounded-full mr-2"/>
                <span className="text-xl font-bold text-primary-900 dark:text-primary-100 break-all">{selectedDestination.amount} {selectedDestination.token.symbol}</span>
              </div>
              <div className="text-xs text-primary-500 dark:text-primary-400 break-all truncate mt-1">Recipient: {selectedDestination.destinationAddress}</div>
            </div>
          </div>
        </div>
      )}

      {step === 1 && <ConnectWallet onConnect={handleConnectWallet} />}
      
      {step === 2 && isConnected && (
        <SelectBlockchain
          selectedChain={formData.blockchain}
          onSelect={(chainName) => {
            handleInputChange({ target: { name: 'blockchain', value: chainName } } as React.ChangeEvent<HTMLSelectElement>);
            setStep(3);
          }}
          onBack={() => {
            if (swapParams.dst.length > 1) {
                setSelectedDestination(null);
            }
            setStep(1)
          }}
          onDisconnect={disconnect}
        />
      )}
      
      {step === 3 && isConnected && formData.blockchain && selectedDestination && (
        <SelectToken
          selectedChain={formData.blockchain}
          selectedToken={formData.sourceToken}
          onSelect={(token: TokenInfo) => setSourceTokenInForm(token)}
          amount={formData.amount}
          onAmountChange={(amount: string) => handleInputChange({ target: { name: 'amount', value: amount } } as React.ChangeEvent<HTMLInputElement>)}
          destinationAddress={selectedDestination.destinationAddress}
          onBack={() => setStep(2)}
          onGenerateQRs={handleGenerateQRs}
        />
      )}
    </div>
  );
};

export default SwapPage;
