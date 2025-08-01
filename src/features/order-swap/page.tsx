import { useState, useEffect } from 'react';
import { useOrderFromUrl } from './hooks/use-order-from-url';
import WalletDeeplinkQRs from '../../features/wallet-deeplink/WalletDeeplinkQRs';
import Combined1InchSwapQRCode from '../../features/create-order/components/Combined1InchSwapQRCode'; // Renamed
import { getBlockchainLogo, getTokenLogoURI } from '../../utils/token-helpers'; // Changed import from local blocklessLogo to the helper
import blocklessLogo from '../../assets/blockless.svg'; // Fallback
import OneInchLogo from '../../assets/1inch.svg'; // Re-using 1inch logo for clarity where the swap is powered from
import type { OrderData } from '../../features/create-order/hooks/useCreateOrderForm'; // Import OrderData type


const formatCurrency = (amount: number, currencyCode: string) => {
    try {
        return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currencyCode }).format(amount);
    } catch (e) {
        console.error("Error formatting currency:", e);
        return `${amount} ${currencyCode}`;
    }
};

export default function OrderSwapPage() {
    const { order, loading, error } = useOrderFromUrl();
    const [activeTab, setActiveTab] = useState<string>(''); // For current active payment method tab

    // Set initial active tab once order is loaded
    useEffect(() => {
        if (order) {
            const firstValidChain = order.chains.find(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));
            if (firstValidChain) {
                setActiveTab(firstValidChain.name);
            } else if (order.crossChainUrl) {
                // If no specific chain has an amount, but a cross-chain URL exists, default to that tab.
                setActiveTab('combined-cross-chain-swap');
            }
        }
    }, [order]);

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading order...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    if (!order) {
        return <div className="text-center p-8 text-gray-500">No order details found.</div>;
    }

    const { fiatAmount, fiatCurrency, chains, crossChainUrl } = order;

    // Filter chains to only show those with at least one token with amount > 0
    const payableChains = chains.filter(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));

    // Calculate tab counts
    const walletTransferCount = payableChains.reduce((acc, chain) => acc + chain.tokens.filter(token => parseFloat(token.amount) > 0).length, 0);
    const combinedSwapCount = crossChainUrl ? 1 : 0; // Only one combined QR

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Payment Request: {formatCurrency(fiatAmount, fiatCurrency)}
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                    Scan or tap to pay with your preferred cryptocurrency.
                </p>
            </div>

            <div className="sticky top-0 z-10 bg-white dark:bg-primary-950 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Payment Tabs">
                    {/* Wallet Transfer Tabs (one per chain) */}
                    {payableChains.map((chain) => {
                        const chainQRsCount = chain.tokens.filter(token => parseFloat(token.amount) > 0).length;
                        if (chainQRsCount === 0) return null;
                        return (
                            <button
                                key={chain.name}
                                onClick={() => setActiveTab(chain.name)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === chain.name ? 'border-gray-500 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                <img src={getBlockchainLogo(chain.name)} alt={chain.name} className="h-5 w-5 mr-2 inline-block rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }} />
                                {chain.name} ({chainQRsCount})
                            </button>
                        );
                    })}
                    {/* Combined Cross-Chain Swap Tab */}
                    {combinedSwapCount > 0 && (
                        <button
                            onClick={() => setActiveTab('combined-cross-chain-swap')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'combined-cross-chain-swap' ? 'border-b-2 border-gray-500 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <img src={OneInchLogo} alt="1inch" className="h-5 w-5 mr-2 inline-block rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }} />
                            Cross-Chain Swap ({combinedSwapCount})
                        </button>
                    )}
                </nav>
            </div>

            <div className="py-6">
                {/* Individual Chain Wallet Transfers Content */}
                {payableChains.map((chain) => activeTab === chain.name && (
                    <div key={chain.name}>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay with Wallet on {chain.name}</h3>
                        <div className="space-y-6">
                            {chain.tokens.filter((token) => parseFloat(token.amount) > 0).map((token) => (
                                <div key={token.symbol} className="p-4 bg-gray-100 dark:bg-primary-900/50 rounded-lg">
                                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pay {token.amount} {token.symbol}</h4>
                                    <WalletDeeplinkQRs
                                        blockchainName={chain.name}
                                        tokenSymbol={token.symbol}
                                        amount={token.amount}
                                        recipientAddress={chain.address}
                                        fiatAmount={fiatAmount}
                                        fiatCurrency={fiatCurrency}
                                        isTransferType="direct-wallet" // Indicate this is a direct wallet transfer
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {/* Combined Cross-Chain Swap Content */}
                {activeTab === 'combined-cross-chain-swap' && crossChainUrl && (
                    <Combined1InchSwapQRCode order={order as any as OrderData} onBackToOrderDetails={() => { /* no-op */ }} />
                )}
                {activeTab === 'combined-cross-chain-swap' && !crossChainUrl && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No valid combined cross-chain swap URL could be generated. Ensure at least one token is configured.</p>
                )}
            </div>
        </div>
    );
}

