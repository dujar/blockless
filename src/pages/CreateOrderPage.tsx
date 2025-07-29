import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMerchantConfig } from '../hooks/useMerchantConfig';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from '../assets/blockless.svg';
import WalletDeeplinkQRs from '../features/wallet-deeplink/WalletDeeplinkQRs';

// Mock prices - in a real app, this would come from an API
const MOCK_PRICES: Record<string, number> = {
  'ETH': 3500, 'WETH': 3500, 'MATIC': 0.7, 'BNB': 600, 'AVAX': 35,
  'USDC': 1, 'DAI': 1,
};

const CreateOrderPage = () => {
  const { config, isRegistered, isLoaded } = useMerchantConfig();
  const [fiatAmount, setFiatAmount] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateOrder = () => {
    if (!config || !fiatAmount) return;

    const amount = parseFloat(fiatAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newOrder = {
      fiatAmount: amount,
      fiatCurrency: config.fiatCurrency,
      chains: config.chains.map(chain => ({
        ...chain,
        tokens: chain.tokens.map(tokenSymbol => {
          const price = MOCK_PRICES[tokenSymbol] || 0;
          const cryptoAmount = price > 0 ? (amount / price).toFixed(6) : '0';
          return { symbol: tokenSymbol, amount: cryptoAmount };
        })
      })),
    };

    const crossChainParams = new URLSearchParams();
    newOrder.chains.forEach(chain => {
      chain.tokens.forEach(token => {
        if (parseFloat(token.amount) > 0) {
          const dst = `${chain.name}:${token.amount}:${token.symbol}:${chain.address}`;
          crossChainParams.append('dst', dst);
        }
      });
    });
    
    (newOrder as any).crossChainUrl = `${window.location.origin}/swap?${crossChainParams.toString()}`;

    setOrder(newOrder);
    setActiveTab(newOrder.chains[0]?.name || 'cross-chain');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isLoaded) return <div>Loading configuration...</div>;

  if (!isRegistered) {
    return (
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Merchant Profile Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          To create an order, you first need to register your payment preferences.
        </p>
        <Link
          to="/register"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Register Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!order ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create a New Order</h1>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Amount
              </label>
              <input
                type="number"
                value={fiatAmount}
                onChange={e => setFiatAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-lg font-medium text-gray-900 dark:text-white">
              {config?.fiatCurrency}
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={!fiatAmount}
            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Payment Options
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order: {order.fiatAmount} {order.fiatCurrency}
            </h1>
            <button onClick={() => setOrder(null)} className="text-blue-500 hover:underline">
              New Order
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {order.chains.map((chain: any) => (
                <button
                  key={chain.name}
                  onClick={() => setActiveTab(chain.name)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === chain.name
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {chain.name}
                </button>
              ))}
              <button
                onClick={() => setActiveTab('cross-chain')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cross-chain'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Cross-Chain Swap
              </button>
            </nav>
          </div>
          
          <div className="py-6">
            {order.chains.map((chain: any) =>
                activeTab === chain.name && (
                    <div key={chain.name}>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay with Wallet on {chain.name}</h3>
                        <WalletDeeplinkQRs 
                            blockchainName={chain.name} 
                            // This component only supports one token. A real implementation would need a picker.
                            // For demo, we'll use the first token.
                            tokenSymbol={chain.tokens[0].symbol} 
                            amount={chain.tokens[0].amount}
                            recipientAddress={chain.address}
                        />
                    </div>
                )
            )}
            {activeTab === 'cross-chain' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay from any Chain/Token</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Scan this QR code with any standard QR reader to open the cross-chain swap page.</p>
                <div className="flex justify-center mb-4">
                  <div className="p-2 bg-white rounded-lg border-4 border-blue-500">
                    <QRCode value={order.crossChainUrl} size={256} logoImage={blocklessLogo} logoWidth={64} logoHeight={64} />
                  </div>
                </div>
                <div 
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    onClick={() => copyToClipboard(order.crossChainUrl)}
                >
                    <div className="flex justify-between items-center text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Shareable Swap Link
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </div>
                    <div className="text-xs font-mono break-all text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                        {order.crossChainUrl}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderPage;
