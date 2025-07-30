import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMerchantConfig } from '../hooks/useMerchantConfig';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from '../assets/blockless.svg';
import WalletDeeplinkQRs from '../features/wallet-deeplink/WalletDeeplinkQRs';
import type { MerchantChainConfig } from '../types';
import type { TokenInfoDto } from '../services/types'; // Import TokenInfoDto
import { blockchainData } from '../data/blockchains'; // Import blockchainData for chain details
import { getCurrencyDataFromCountries, getTokenLogoURI, getRiskInfo, TOKEN_CATEGORIES, NATIVE_TOKENS_INFO, COMMON_STABLECOINS_INFO, getCategory } from '../utils/token-helpers'; // Import token helpers
import { countries } from '../data/countries'; // Import countries data
import OneInchLogo from '../assets/1inch.svg'; // For the cross-chain tab

// Extend MerchantChainConfig to include calculated token amounts and full token info
interface OrderChainConfig extends Omit<MerchantChainConfig, 'tokens'> {
  tokens: { symbol: string; amount: string; info: TokenInfoDto }[]; // Added info property
}

interface OrderData {
  fiatAmount: number;
  fiatCurrency: string;
  chains: OrderChainConfig[];
  crossChainUrl: string;
}

// Mock prices - now dynamic and can be 'refreshed'
// Initialize with some plausible default prices
const initialMockPrices: Record<string, number> = {
  'ETH': 3500, 'WETH': 3500, 'MATIC': 0.7, 'BNB': 600, 'AVAX': 35,
  'USDC': 1, 'DAI': 1, 'USDT': 1, // Added USDT
};

interface CrossChainQRCodeSectionProps {
    order: OrderData;
    onBackToOrderDetails: () => void;
}

const CrossChainQRCodeSection = ({ order, onBackToOrderDetails }: CrossChainQRCodeSectionProps) => {
    const [isFullScreenQR, setIsFullScreenQR] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const formatCurrency = (amount: number, currencyCode: string) => {
        try {
            return new Intl.NumberFormat(navigator.language, {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        } catch (e) {
            console.error("Error formatting currency:", e);
            return `${amount} ${currencyCode}`;
        }
    };

    const renderPaymentSummary = () => {
        const uniqueTokens = new Map<string, TokenInfoDto>();
        order.chains.forEach(chain => {
            chain.tokens.forEach(token => {
                if (parseFloat(token.amount) > 0 && !uniqueTokens.has(token.symbol)) {
                    uniqueTokens.set(token.symbol, token.info);
                }
            });
        });

        const tokensForDisplay = Array.from(uniqueTokens.values()).slice(0, 3); // Limit to 3 for brevity

        return (
            <div className="flex items-center text-gray-900 dark:text-white text-xl font-bold">
                Pay {formatCurrency(order.fiatAmount, order.fiatCurrency)} with:
                <div className="flex ml-2 space-x-1">
                    {tokensForDisplay.map(token => (
                        <img 
                            key={token.symbol}
                            src={token.logoURI || blocklessLogo} 
                            alt={token.symbol} 
                            className="h-6 w-6 rounded-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }}
                            title={token.symbol}
                        />
                    ))}
                    {uniqueTokens.size > 3 && <span className="text-base text-gray-600 dark:text-gray-400"> +{uniqueTokens.size - 3} more</span>}
                </div>
            </div>
        );
    };

    return (
        <div className={isFullScreenQR ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between' : ''}>
            {isFullScreenQR && (
                <div className="text-center mb-4">
                    {renderPaymentSummary()}
                </div>
            )}
            <div className={`flex flex-col items-center ${isFullScreenQR ? 'flex-grow justify-center' : ''}`}>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay from any Chain/Token</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Scan this QR code with any standard QR reader to open the cross-chain swap page.</p>
                <div className="flex justify-center mb-4">
                    <div 
                        className="p-2 bg-white rounded-lg border-4 border-blue-500 cursor-pointer"
                        onClick={() => setIsFullScreenQR(true)}
                    >
                        <QRCode 
                            value={order.crossChainUrl} 
                            size={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) : 256} 
                            logoImage={blocklessLogo} 
                            logoWidth={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 64} 
                            logoHeight={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 64}
                        />
                    </div>
                </div>
                <div 
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group w-full"
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
            <div className={`flex ${isFullScreenQR ? 'mt-auto justify-center' : 'mt-6 justify-center'}`}>
                <button
                    onClick={isFullScreenQR ? () => setIsFullScreenQR(false) : onBackToOrderDetails}
                    className="px-4 py-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                >
                    ← {isFullScreenQR ? 'Exit Fullscreen' : 'Back to Order Details'}
                </button>
            </div>
        </div>
    );
}

const CreateOrderPage = () => {
  const { config, isRegistered, isLoaded } = useMerchantConfig();
  const [fiatAmountInput, setFiatAmountInput] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [step, setStep] = useState(1); // 1: Enter Fiat, 2: Display Conversion, 3: Display QRs
  const [activeTab, setActiveTab] = useState(''); // Used for QR display tabs
  const [mockPrices, setMockPrices] = useState<Record<string, number>>(initialMockPrices);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date>(new Date());
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [tokenInfoMap, setTokenInfoMap] = useState<Record<string, TokenInfoDto>>({}); // Map for all token infos, key: `${chainId}-${symbol}`

  const currenciesData = useMemo(() => getCurrencyDataFromCountries(countries), []);
  const selectedCurrencyInfo = useMemo(() => currenciesData.find(c => c.code === config?.fiatCurrency), [currenciesData, config?.fiatCurrency]);

  // Function to simulate price update
  const simulatePriceUpdate = useCallback(() => {
    setLoadingPrices(true);
    // Simulate API call delay
    setTimeout(() => {
      const newPrices: Record<string, number> = {};
      for (const symbol in initialMockPrices) {
        // Simulate a small fluctuation
        newPrices[symbol] = initialMockPrices[symbol] * (1 + (Math.random() - 0.5) * 0.02); // +/- 1%
      }
      setMockPrices(newPrices);
      setLastPriceUpdate(new Date());
      setLoadingPrices(false);
    }, 500); // Simulate network delay
  }, []);

  useEffect(() => {
    // Initial price load or update on component mount/config change
    simulatePriceUpdate();

    // Fetch or generate all relevant token infos once when config is loaded
    if (config?.chains && config.chains.length > 0) {
      const updatedTokenInfoMap: Record<string, TokenInfoDto> = {};
      config.chains.forEach(chainConfig => {
        const chainId = blockchainData.find(b => b.name === chainConfig.name)?.chainId;
        if (chainId) {
          chainConfig.tokens.forEach(symbol => {
            const tokenIdentifier = `${chainId}-${symbol}`;
            
            // Prioritize existing static/mocked data if available
            let tokenAddress: string = `0x${'a'.repeat(40)}`; // Default placeholder
            let decimals: number = 18; // Default
            let tags: string[] = [];

            // Check native tokens info
            const nativeInfo = NATIVE_TOKENS_INFO[chainConfig.name];
            if (nativeInfo && nativeInfo.symbol === symbol) {
              tokenAddress = nativeInfo.address;
              decimals = nativeInfo.decimals;
              tags.push('native');
            }

            // Check common stablecoins info
            const stablecoinInfo = COMMON_STABLECOINS_INFO.find(sc => sc.chainId === chainId && sc.symbol === symbol);
            if (stablecoinInfo) {
              tokenAddress = stablecoinInfo.address;
              decimals = stablecoinInfo.decimals;
              tags.push('PEG:stablecoin');
            }

            // For other tokens, we'd ideally fetch from 1inch Token API.
            // For now, if not a native/stablecoin, apply some mock risks for demonstration
            if (!tags.includes('native') && !tags.includes('PEG:stablecoin')) {
                if (symbol === 'XYZ') tags.push('RISK:suspicious'); // Example mock risk
                if (symbol === 'MAL') tags.push('RISK:malicious'); // Example mock risk
            }

            const logoURI = getTokenLogoURI(tokenAddress, symbol, chainConfig.name);
            
            updatedTokenInfoMap[tokenIdentifier] = {
              address: tokenAddress,
              chainId: chainId,
              decimals: decimals,
              extensions: {},
              logoURI: logoURI,
              name: symbol,
              symbol: symbol,
              tags: tags,
            };
          });
        }
      });
      setTokenInfoMap(updatedTokenInfoMap);
    }
  }, [config?.chains, simulatePriceUpdate]); // Re-run when configured chains change or when prices update

  const handleCreateOrder = () => {
    if (!config || !fiatAmountInput) return;

    const amount = parseFloat(fiatAmountInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newOrder: OrderData = {
      fiatAmount: amount,
      fiatCurrency: config.fiatCurrency,
      chains: config.chains.map(chainConfig => {
        const chainId = blockchainData.find(b => b.name === chainConfig.name)?.chainId;
        const processedTokens: { symbol: string; amount: string; info: TokenInfoDto }[] = [];

        chainConfig.tokens.forEach(tokenSymbol => {
          const price = mockPrices[tokenSymbol] || 0;
          const cryptoAmount = price > 0 ? (amount / price).toFixed(6) : '0.000000'; // If price is 0, cryptoAmount is '0.000000'

          const tokenIdentifier = `${chainId}-${tokenSymbol}`;
          const tokenDetails = tokenInfoMap[tokenIdentifier]; // Get the pre-fetched/mocked token info

          if (tokenDetails) {
            processedTokens.push({ symbol: tokenSymbol, amount: cryptoAmount, info: tokenDetails });
          } else {
            // Fallback for cases where tokenInfoMap might not have the entry
            processedTokens.push({
              symbol: tokenSymbol,
              amount: cryptoAmount,
              info: {
                address: '0x' + (Math.random() * 0xffffff).toString(16).padEnd(40, '0'),
                chainId: chainId!, // Assume chainId exists
                decimals: 18,
                extensions: {},
                logoURI: getTokenLogoURI('0x', tokenSymbol, chainConfig.name),
                name: tokenSymbol,
                symbol: tokenSymbol,
                tags: []
              }
            });
          }
        });
        
        // Sort tokens based on whether they have a positive amount, then by risk categories (safest to riskiest), then alphabetically
        processedTokens.sort((a, b) => {
            const aHasAmount = parseFloat(a.amount) > 0;
            const bHasAmount = parseFloat(b.amount) > 0;

            // Primary sort: Prioritize tokens with a valid amount (true comes before false)
            if (aHasAmount !== bHasAmount) {
                return aHasAmount ? -1 : 1; // If aHasAmount is true and bHasAmount is false, a comes first.
            }

            // Secondary sort: If both have amounts (or both don't), sort by risk categories
            const categoryA = getCategory(a.info);
            const categoryB = getCategory(b.info);
            const orderA = Object.values(TOKEN_CATEGORIES).find(c => c.label === categoryA)?.order ?? 99;
            const orderB = Object.values(TOKEN_CATEGORIES).find(c => c.label === categoryB)?.order ?? 99;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            // Tertiary sort: Alphabetical within the same category and amount status
            return a.symbol.localeCompare(b.symbol);
        });

        return {
          ...chainConfig,
          tokens: processedTokens,
        };
      }),
      crossChainUrl: '',
    };

    const crossChainParams = new URLSearchParams();
    const validDstParams: string[] = [];
    newOrder.chains.forEach(chain => {
      chain.tokens.forEach(token => {
        if (parseFloat(token.amount) > 0 && chain.address && token.info.symbol) {
          // If token.info.address is 'native', it needs to be mapped to its WETH/wrapped equivalent for Fusion+ link.
          // For now, we'll keep it simple for the QR link by using the symbol.
          // The `parseSwapParams` in `SwapParamSafe.tsx` handles `token.symbol` or `token.address`.
          const dst = `${chain.name}:${token.amount}:${token.info.symbol}:${chain.address}`;
          validDstParams.push(dst);
        }
      });
    });

    if (validDstParams.length > 0) {
      validDstParams.forEach(param => crossChainParams.append('dst', param));
      newOrder.crossChainUrl = `${window.location.origin}/swap?${crossChainParams.toString()}`;
    } else {
      newOrder.crossChainUrl = '';
    }
    
    setOrder(newOrder);
    setStep(2);
    // Set initial tab to the first chain with valid tokens, or cross-chain if no specific chain has tokens
    const firstValidChain = newOrder.chains.find(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));
    setActiveTab(firstValidChain?.name || (newOrder.crossChainUrl ? 'cross-chain' : ''));
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (e) {
      console.error("Error formatting currency:", e);
      return `${amount} ${currencyCode}`;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  if (!isLoaded) return <div className="text-center p-8">Loading configuration...</div>;

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
      {/* Step 1: Enter Fiat Amount */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create a New Order</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Enter the desired amount in your preferred fiat currency.
          </p>
          <div className="mb-8">
            <label htmlFor="fiat-amount-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Amount
            </label>
            {/* Updated input field for enhanced UI/UX */}
            <div className="relative rounded-lg shadow-sm flex items-center bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-blue-600">
                <div className="flex items-center pl-3 pr-2">
                    <div className="flex -space-x-2 mr-2 flex-shrink-0">
                        {selectedCurrencyInfo?.countries.slice(0, 3).map(country => (
                            <img key={country.name} src={country.flag} alt={country.name} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                        ))}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                        {selectedCurrencyInfo?.symbol || config?.fiatCurrency}
                    </span>
                </div>
                <input
                    id="fiat-amount-input"
                    type="number"
                    value={fiatAmountInput}
                    onChange={e => setFiatAmountInput(e.target.value)}
                    className="block flex-1 py-3 pr-3 bg-transparent text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-2xl sm:leading-6 dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                />
                <div className="flex items-center pr-3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {selectedCurrencyInfo?.code || config?.fiatCurrency}
                    </span>
                </div>
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={!fiatAmountInput || parseFloat(fiatAmountInput) <= 0}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Payment Options
          </button>
        </div>
      )}

      {/* Step 2: Display Converted Amounts */}
      {step === 2 && order && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}
            </h1>
            <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-blue-500 hover:underline">
              ← New Order
            </button>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>Last rates update: {formatTimeAgo(lastPriceUpdate)}</span>
            <button
              onClick={simulatePriceUpdate}
              className={`text-blue-500 hover:underline flex items-center ${loadingPrices ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loadingPrices}
            >
              {loadingPrices ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m7-10V4m0 2.291c1.135 1.041 2.524 1.838 4 2.291m-4-2.291V2m0 10l-2.291 3.709A8.001 8.001 0 0012 20h4M4 12h12m-8 4h8a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
              )}
              Refresh Rates
            </button>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Customers can pay this amount using any of your configured cryptocurrencies:
          </p>

          <div className="space-y-6 mb-8">
            {order.chains.length > 0 ? order.chains.map(chain => (
              <div key={chain.name} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{chain.name} Payments</h3>
                <p className="text-sm font-mono break-all text-gray-700 dark:text-gray-300 mb-4">
                  Recipient Address: {chain.address}
                </p>
                <div className="space-y-3">
                  {chain.tokens.filter(token => parseFloat(token.amount) > 0).map(token => {
                    const riskInfo = getRiskInfo(token.info.tags || []);
                    return (
                      <div key={token.symbol} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <img 
                            src={token.info.logoURI || blocklessLogo} 
                            alt={token.info.symbol} 
                            className="h-6 w-6 mr-2 rounded-full" 
                            onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }}
                          />
                          <span className="text-base font-medium text-gray-900 dark:text-white mr-2">
                              Pay {token.amount} {token.symbol}
                          </span>
                          {riskInfo.level > 1 && <span className={`text-xs font-semibold ${riskInfo.color}`}>({riskInfo.label})</span>}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          from {formatCurrency(order.fiatAmount, order.fiatCurrency)}
                        </span>
                      </div>
                    );
                  })}
                  {chain.tokens.filter(token => parseFloat(token.amount) > 0).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No convertible tokens configured for this chain.</p>
                  )}
                </div>
              </div>
            )) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                    No chains or tokens configured. Please go to <Link to="/register" className="text-blue-500 hover:underline">Register</Link> to set them up.
                </div>
            )}
          </div>
          
          <button
            onClick={() => setStep(3)}
            disabled={!order || order.chains.every(chain => chain.tokens.every(token => parseFloat(token.amount) <= 0))} // Disable if no valid tokens to display QRs for
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition ${
              (!order || order.chains.every(chain => chain.tokens.every(token => parseFloat(token.amount) <= 0))) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Generate QR Codes
          </button>
        </div>
      )}

      {/* Step 3: Display QR Codes */}
      {step === 3 && order && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}
            </h1>
            {/* The "New Order" button always resets the state to step 1 */}
            <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-blue-500 hover:underline">
              New Order
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {order.chains.map((chain) =>
                chain.tokens.some((token) => parseFloat(token.amount) > 0) && ( // Only show tab if chain has valid tokens
                  <button
                    key={chain.name}
                    onClick={() => setActiveTab(chain.name)}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === chain.name
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <img 
                      src={getTokenLogoURI('native', '', chain.name)} // Use native token logo for the chain tab
                      alt={chain.name} 
                      className="h-5 w-5 mr-2 inline-block rounded-full" 
                      onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }}
                    />
                    {chain.name}
                  </button>
                )
              )}
              {order.crossChainUrl && ( // Only show cross-chain tab if URL is valid
                <button
                  onClick={() => setActiveTab('cross-chain')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'cross-chain'
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <img 
                    src={OneInchLogo} // Use 1inch logo for cross-chain tab
                    alt="1inch" 
                    className="h-5 w-5 mr-2 inline-block rounded-full" 
                    onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }}
                  />
                  Cross-Chain Swap
                </button>
              )}
            </nav>
          </div>
          
          <div className="py-6">
            {order.chains.map((chain) =>
                activeTab === chain.name && (
                    <div key={chain.name}>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay with Wallet on {chain.name}</h3>
                        <div className="space-y-6">
                          {chain.tokens.filter((token) => parseFloat(token.amount) > 0).map((token) => (
                            <div key={token.symbol} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                Pay {token.amount} {token.symbol}
                              </h4>
                              <WalletDeeplinkQRs 
                                  blockchainName={chain.name} 
                                  tokenSymbol={token.symbol} 
                                  amount={token.amount}
                                  recipientAddress={chain.address}
                                  fiatAmount={order.fiatAmount} // Pass fiat amount
                                  fiatCurrency={order.fiatCurrency} // Pass fiat currency
                              />
                            </div>
                          ))}
                          {chain.tokens.filter((token) => parseFloat(token.amount) > 0).length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No convertible tokens available for QR codes on this chain.</p>
                          )}
                        </div>
                    </div>
                )
            )}
            {activeTab === 'cross-chain' && order.crossChainUrl && (
                <CrossChainQRCodeSection 
                    order={order}
                    onBackToOrderDetails={() => setStep(2)}
                />
            )}
            {activeTab === 'cross-chain' && !order.crossChainUrl && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No valid cross-chain swap URL could be generated. Ensure at least one token is configured.</p>
            )}
          </div>
          {/* Added 'Back to Order Details' button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setStep(2)} // Go back to Step 2 (Order Details)
              className="px-4 py-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
            >
              ← Back to Order Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderPage;

