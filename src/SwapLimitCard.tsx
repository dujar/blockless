// SwapLimitCard.tsx
import { useState, useEffect, type ChangeEvent, type FC } from 'react';

interface Token {
  symbol: string;
  name: string;
  chain: string;
  iconUrl?: string;
}

interface SwapLimitCardProps {
  prefilledAmount?: string;
  prefilledBlockchain?: string;
  prefilledTargetAddress?: string;
}

const SwapLimitCard: FC<SwapLimitCardProps> = ({ prefilledAmount, prefilledBlockchain, prefilledTargetAddress }) => {
  /* ----------------- STATE ----------------- */
  const [youPay, setYouPay] = useState<string>('0.004');
  const [youReceive, setYouReceive] = useState<string>('0');
  const [payToken, setPayToken] = useState<Token>({
    symbol: 'ETH',
    name: 'Ether',
    chain: 'Ethereum',
    iconUrl: '/eth.svg',
  });
  const [receiveToken, setReceiveToken] = useState<Token>({
    symbol: 'ETH',
    name: 'Ethereum Token',
    chain: 'BNB Chain',
    iconUrl: '/eth-bnb.svg',
  });

  // Use prefilled values when they change
  useEffect(() => {
    if (prefilledAmount) {
      setYouPay(prefilledAmount);
      setYouReceive(prefilledAmount); // For the 1:1 conversion in this demo
    }
    
    if (prefilledBlockchain) {
      // Update token based on blockchain
      setPayToken(prev => ({
        ...prev,
        chain: prefilledBlockchain
      }));
    }
  }, [prefilledAmount, prefilledBlockchain]);

  /* ------------- DERIVED VALUES ------------ */
  const payAmount = parseFloat(youPay) || 0;
  const receiveAmount = parseFloat(youReceive) || 0;

  const ethPriceUsd = 3743.16;
  const priceImpact = -100; // hard-coded for demo
  const slippage = 0.1; // %
  const minimumReceive = receiveAmount * (1 - slippage / 100);
  const networkFee = 0;

  /* ------------- HANDLERS ------------------ */
  const handlePayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYouPay(val);
    // naive 1:1 conversion – replace with real quote logic
    setYouReceive(val);
  };

  const handleReceiveChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYouReceive(val);
    // reverse: pay = receive
    setYouPay(val);
  };

  const insufficientBalance = payAmount > 0.004;

  const handleSwap = () => {
    // In a real implementation, this would call the swap function with the target address
    console.log('Swapping', payAmount, 'to', receiveToken, 'for target address:', prefilledTargetAddress || 'user wallet');
    alert(`Swapping ${payAmount} ${payToken.symbol} to ${receiveToken.symbol} ${(prefilledTargetAddress ? `to ${prefilledTargetAddress}` : 'to your wallet')}`);
  };

  /* ------------- RENDER -------------------- */
  return (
    <div className="max-w-sm mx-auto bg-gray-900 text-white rounded-2xl p-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Swap Limit</h2>
        <div className="flex space-x-2 text-gray-400">
          <button>C</button>
          <button>≈</button>
        </div>
      </div>

      {/* You Pay */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">You pay</span>
          <span className="text-gray-400">Balance: 0.004 MAX</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={payToken.iconUrl} alt="" className="w-6 h-6" />
            <span className="font-medium">{payToken.symbol}</span>
            <span className="text-xs text-gray-400">on {payToken.chain}</span>
          </div>
          <input
            type="number"
            value={youPay}
            onChange={handlePayChange}
            className="bg-transparent text-right text-xl w-1/2 outline-none"
          />
        </div>
        <div className="text-right text-sm text-gray-400">
          ≈${(payAmount * ethPriceUsd).toFixed(2)}
        </div>
      </div>

      {/* You Receive */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">You receive</span>
          <span className="text-gray-400">Balance: 0</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={receiveToken.iconUrl} alt="" className="w-6 h-6" />
            <span className="font-medium">{receiveToken.symbol}</span>
            <span className="text-xs text-gray-400">on {receiveToken.chain}</span>
          </div>
          <input
            type="number"
            value={youReceive}
            onChange={handleReceiveChange}
            className="bg-transparent text-right text-xl w-1/2 outline-none"
          />
        </div>
        <div className="text-right text-sm text-gray-400">
          ≈${(receiveAmount * ethPriceUsd).toFixed(2)} ({priceImpact}%)
        </div>
      </div>

      {/* Target Address */}
      {prefilledTargetAddress && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Target Address</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm break-all">{prefilledTargetAddress}</div>
          </div>
        </div>
      )}

      {/* Rate */}
      <div className="text-sm text-gray-400">
        1 {payToken.symbol} = 1 {receiveToken.symbol} ≈${ethPriceUsd.toFixed(2)}
      </div>

      {/* Details */}
      <div className="text-sm space-y-1 text-gray-400">
        <div className="flex justify-between">
          <span>Slippage tolerance</span>
          <span>Auto {slippage}%</span>
        </div>
        <div className="flex justify-between">
          <span>Minimum receive</span>
          <span>
            ${(minimumReceive * ethPriceUsd).toFixed(2)} {minimumReceive.toFixed(8)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Network Fee</span>
          <span>{networkFee ? `$${networkFee}` : 'Free'}</span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={handleSwap}
        disabled={insufficientBalance}
        className={`w-full py-3 rounded-lg font-semibold transition
          ${insufficientBalance
            ? 'bg-red-700/30 text-red-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {insufficientBalance ? 'Insufficient ETH balance' : 'Swap'}
      </button>
    </div>
  );
};

export default SwapLimitCard;