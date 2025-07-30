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
  crossChainUrl: string; // This is the Blockless DApp swap page URL
}

// Reusable component for the Cross-Chain QR Code section
interface CrossChainQRCodeSectionProps {
    order: OrderData;
    onBackToOrderDetails: () => void;
}

const CrossChainQRCodeSection = ({ order, onBackToOrderDetails }: CrossChainQRCodeSectionProps) => {
    const [isFullScreenQR, setIsFullScreenQR] = useState(false); // State for full-screen for Blockless QR
    const [copiedBlocklessLink, setCopiedBlocklessLink] = useState(false); // State for Blockless link copy
    const [copied1inchLink, setCopied1inchLink] = useState(false);       // State for 1inch link copy
    const [showSocialShareOptions, setShowSocialShareOptions] = useState(false);

    // Find the first available token with a positive amount for the 1inch.io QR
    const firstAvailableTokenFor1inchQR = useMemo(() => {
        for (const chainConfig of order.chains) {
            // Find the blockchain details using chainConfig.name
            const chainInfo = blockchainData.find(b => b.name === chainConfig.name);
            if (!chainInfo) continue;

            for (const token of chainConfig.tokens) {
                if (parseFloat(token.amount) > 0 && token.info.symbol) {
                    return {
                        ...token,
                        chainName: chainConfig.name,
                        chainId: chainInfo.chainId // Add chainId for building the 1inch URL
                    };
                }
            }
        }
        return null;
    }, [order.chains]);

    // Construct the 1inch.io direct swap URL
    const oneInchSwapUrl = useMemo(() => {
        if (!firstAvailableTokenFor1inchQR || !firstAvailableTokenFor1inchQR.chainId) return null;

        // This constructs a 1inch.io deep link to swap to the specified destination token and amount
        // The `dst` parameter format used by 1inch.io for payment links is `amount:symbol:address`.
        // We'll use the recipient address from the order's first token on that chain.
        const recipientAddress = order.chains.find(c => c.name === firstAvailableTokenFor1inchQR.chainName)?.address;
        if (!recipientAddress) return null;

        return `https://app.1inch.io/swap?dst=${firstAvailableTokenFor1inchQR.amount}:${firstAvailableTokenFor1inchQR.symbol}:${recipientAddress}`;

    }, [firstAvailableTokenFor1inchQR, order.chains]);

    const copyToClipboard = (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedState(true);
            setTimeout(() => setCopiedState(false), 2000);
        });
    };

    const handleOpenLink = (url: string) => {
        window.open(url, '_blank');
    };

    const handleShareClick = () => {
        setShowSocialShareOptions(prev => !prev);
    };

    const shareOnSocialMedia = (platform: 'twitter' | 'facebook' | 'linkedin', url: string, text: string) => {
        if (navigator.share) {
            // Use Web Share API if available (typically on mobile)
            navigator.share({
                title: 'Blockless Swap Order',
                text: text,
                url: url,
            }).catch(console.error);
        } else {
            // Fallback for desktop or non-supporting browsers
            let shareUrl = '';
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent('Blockless Swap Order')}&summary=${encodeURIComponent(text)}`;
                    break;
                default:
                    return;
            }
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
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
                    {uniqueTokens.size > 3 && <span className="text-base text-gray-700 dark:text-gray-400"> +{uniqueTokens.size - 3} more</span>}
                </div>
            </div>
        );
    };

    return (
        <div className={isFullScreenQR ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between' : ''} onClick={() => isFullScreenQR && setIsFullScreenQR(false)}>
            {isFullScreenQR && (
                <div className="text-center mb-4" onClick={(e) => e.stopPropagation()}>
                    {renderPaymentSummary()}
                </div>
            )}
            <div className={`flex flex-col ${isFullScreenQR ? 'flex-grow justify-center' : 'space-y-8'}`} onClick={(e) => e.stopPropagation()}> {/* Added space-y-8 for spacing between sections */}
                {/* Blockless Swap Link Section */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay from any Chain/Token</h3>
                    <p className="text-gray-700 dark:text-gray-400 mb-2">Scan this QR code with any standard QR reader to open the Blockless swap page.</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                        This QR code will redirect to a website (it is not a wallet deeplink).
                    </p>
                    <div className="flex justify-center mb-4">
                        <div
                            className="p-2 bg-white rounded-lg border-4 border-primary-500 cursor-pointer"
                            onClick={() => setIsFullScreenQR(true)}
                        >
                            <QRCode
                                value={order.crossChainUrl}
                                size={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) : 256}
                                quietZone={10}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                logoImage={blocklessLogo}
                                logoWidth={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 64}
                                logoHeight={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 64}
                                removeQrCodeBehindLogo={true} // ensure logo is clearly visible
                                logoPadding={2}
                                logoPaddingStyle="circle"
                                qrStyle="squares"
                            />
                        </div>
                    </div>
                    <div
                        className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg group w-full"
                    >
                        <div className="flex justify-between items-center text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                            <span>Shareable Swap Link</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => copyToClipboard(order.crossChainUrl, setCopiedBlocklessLink)}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Copy link"
                                >
                                    {copiedBlocklessLink ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleOpenLink(order.crossChainUrl)}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Open in browser"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleShareClick}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Share"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186A.75.75 0 017.5 12h9.75a.75.75 0 00.75-.75V5.625m0 0a2.25 2.25 0 100 2.186M17.25 12V5.625m0 0H14.25m6.75 0H21M7.217 13.093A2.25 2.25 0 100 2.186m0 0v2.186m0-2.186A.75.75 0 017.5 12h9.75a.75.75 0 00.75-.75V5.625m0 0a2.25 2.25 0 100 2.186M17.25 12V5.625m0 0H14.25M6.75 18H4.5A2.25 2.25 0 012.25 15.75V9.486c0-.354.12-.695.342-.943L6.094 4.148A2.25 2.25 0 017.5 3h.375a2.25 2.25 0 012.25 2.25v.385m0 6.275v-.385M18.75 18H21a2.25 2.25 0 002.25-2.25V9.486c0-.354-.12-.695-.342-.943L18.906 4.148A2.25 2.25 0 0117.5 3h-.375a2.25 2.25 0 00-2.25 2.25v.385m0 6.275v-.385m0 0H9.75m0 0H7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-xs font-mono break-all text-primary-900 dark:text-primary-100 bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                            <a href={order.crossChainUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {order.crossChainUrl}
                            </a>
                        </div>
                        {/* Powered by Blockless section */}
                        <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <span className="mr-1">Powered by</span>
                            <img src={blocklessLogo} alt="Blockless Logo" className="h-4 w-auto" />
                            <span className="ml-1 font-semibold">Blockless</span>
                        </div>
                        {showSocialShareOptions && (
                            <div className="mt-2 flex justify-center space-x-3">
                                <button
                                    onClick={() => shareOnSocialMedia('twitter', order.crossChainUrl, `Securely accept crypto payments for ${formatCurrency(order.fiatAmount, order.fiatCurrency)}! Powered by Blockless, this swap link enables seamless cross-chain transactions. #BlocklessSwap`)}
                                    className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.678 1.174H15.01V.014h-3.328l-3.364 4.542L2.7 0H.581L5.942 6.74l-5.36 7.643H.01l4.088-5.326L1.012 16H3.35L8.064 9.07l5.068 7.23H15.01L9.467 8.01 12.678 1.174zm-2.028 12.046L3.921 2.506H6.608l4.729 10.714h-2.028z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => shareOnSocialMedia('facebook', order.crossChainUrl, `Simplify crypto payments with Blockless Swap! Accept any token from any chain. Learn more: ${order.crossChainUrl} #BlocklessPayment`)}
                                    className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.979H9.93c-.994 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H8.625V16c3.823-.604 6.75-3.934 6.75-7.951z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => shareOnSocialMedia('linkedin', order.crossChainUrl, `Effortlessly accept crypto payments for ${formatCurrency(order.fiatAmount, order.fiatCurrency)} via Blockless Swap. Seamless cross-chain transactions for your business. #CryptoPayments #Blockless`)}
                                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.539-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a.516.516 0 01.016-.025V6.169H6.618z"/>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 1inch.io Direct Swap Link Section */}
                {oneInchSwapUrl && (
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"> {/* Separator */}
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Direct 1inch.io Swap</h3>
                        <p className="text-gray-700 dark:text-gray-400 mb-4">Scan this QR code to initiate a swap directly on 1inch.io in your browser. This will use {firstAvailableTokenFor1inchQR?.symbol} for {formatCurrency(order.fiatAmount, order.fiatCurrency)}.</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                            Note: The transaction will be finalized within your browser on 1inch.io. This QR helps auto-fill the destination token.
                        </p>
                        <div className="flex justify-center mb-4">
                            <div
                                className="p-2 bg-white rounded-lg border-4 border-yellow-500 cursor-pointer"
                            >
                                <QRCode
                                    value={oneInchSwapUrl}
                                    size={256}
                                    logoImage={OneInchLogo}
                                    logoWidth={64}
                                    logoHeight={64}
                                    removeQrCodeBehindLogo={true} // ensure logo is clearly visible
                                    logoPadding={2}
                                    logoPaddingStyle="circle"
                                    qrStyle="squares"
                                />
                            </div>
                        </div>
                        <div
                            className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors group w-full"
                            onClick={() => copyToClipboard(oneInchSwapUrl, setCopied1inchLink)}
                        >
                            <div className="flex justify-between items-center text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                                1inch.io Swap Link
                                <span>{copied1inchLink ? 'Copied!' : 'Copy'}</span>
                            </div>
                            <div className="text-xs font-mono break-all text-yellow-900 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                                {oneInchSwapUrl}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Control button at the bottom. Only one needed as per instruction. */}
            <div className={`flex ${isFullScreenQR ? 'mt-auto justify-center' : 'mt-6 justify-center'}`}>
                <button
                    onClick={isFullScreenQR ? () => setIsFullScreenQR(false) : onBackToOrderDetails}
                    className="px-4 py-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
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
  const [mockPrices, setMockPrices] = useState<Record<string, number>>({
    'ETH': 3500, 'WETH': 3500, 'MATIC': 0.7, 'BNB': 600, 'AVAX': 35,
    'USDC': 1, 'DAI': 1, 'USDT': 1, // Added USDT
  });
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
      for (const symbol in mockPrices) {
        // Simulate a small fluctuation
        newPrices[symbol] = mockPrices[symbol] * (1 + (Math.random() - 0.5) * 0.02); // +/- 1%
      }
      setMockPrices(newPrices);
      setLastPriceUpdate(new Date());
      setLoadingPrices(false);
    }, 500); // Simulate network delay
  }, [mockPrices]);

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
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg shadow-dynamic max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Merchant Profile Not Found</h2>
        <p className="text-gray-700 dark:text-gray-400 mb-6">
          To create an order, you first need to register your payment preferences.
        </p>
        <Link
          to="/register"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition"
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
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg shadow-dynamic">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create a New Order</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Enter the desired amount in your preferred fiat currency.
          </p>
          <div className="mb-8">
            <label htmlFor="fiat-amount-input" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
              Order Amount
            </label>
            {/* Updated input field for enhanced UI/UX */}
            <div className="relative rounded-lg shadow-sm flex items-center bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-primary-600">
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
            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Payment Options
          </button>
        </div>
      )}

      {/* Step 2: Display Converted Amounts */}
      {step === 2 && order && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg shadow-dynamic">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}
            </h1>
            {/* The "New Order" button always resets the state to step 1 */}
            <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-primary-500 hover:underline">
              ← New Order
            </button>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>Last rates update: {formatTimeAgo(lastPriceUpdate)}</span>
            <button
              onClick={simulatePriceUpdate}
              className={`text-primary-500 hover:underline flex items-center ${loadingPrices ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loadingPrices}
            >
              {loadingPrices ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Customers can pay this amount using any of your configured cryptocurrencies:
          </p>

          <div className="space-y-6 mb-8">
            {order.chains.length > 0 ? order.chains.map(chain => (
              <div key={chain.name} className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
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
                        <span className="text-sm text-gray-700 dark:text-gray-300">
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
                <div className="text-center text-gray-600 dark:text-gray-400 p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                    No chains or tokens configured. Please go to <Link to="/register" className="text-primary-500 hover:underline">Register</Link> to set them up.
                </div>
            )}
          </div>
          
          <button
            onClick={() => setStep(3)}
            disabled={!order || order.chains.every(chain => chain.tokens.every(token => parseFloat(token.amount) <= 0))} // Disable if no valid tokens to display QRs for
            className={`w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition ${
              (!order || order.chains.every(chain => chain.tokens.every(token => parseFloat(token.amount) <= 0))) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Generate QR Codes
          </button>
        </div>
      )}

      {/* Step 3: Display QR Codes */}
      {step === 3 && order && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg shadow-dynamic">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}
            </h1>
            {/* The "New Order" button always resets the state to step 1 */}
            <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-primary-500 hover:underline">
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
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
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
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
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
                            <div key={token.symbol} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
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
                                  genericSwapUrl={order.crossChainUrl} // Pass genericSwapUrl
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
        </div>
      )}
    </div>
  );
};

export default CreateOrderPage;

