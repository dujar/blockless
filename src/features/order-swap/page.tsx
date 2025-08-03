import { useState, useEffect } from 'react';
import { useOrderFromUrl } from './hooks/use-order-from-url';
import WalletDeeplinkQRs from '../../features/wallet-deeplink/WalletDeeplinkQRs';
import Combined1InchSwapQRCode from '../../features/create-order/components/Combined1InchSwapQRCode'; // Renamed
import { getBlockchainLogo } from '../../utils/token-helpers'; // Changed import from local blocklessLogo to the helper
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
        return <div className="text-center p-8 text-neutral-content">Loading order...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    if (!order) {
        return <div className="text-center p-8 text-neutral-content">No order details found.</div>;
    }

    const { fiatAmount, fiatCurrency, chains, crossChainUrl } = order;

    // Filter chains to only show those with at least one token with amount > 0
    const payableChains = chains.filter(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));

    // Calculate tab counts
    const combinedSwapCount = crossChainUrl ? 1 : 0; // Only one combined QR

    return (
        <>
        <div className="flex justify-center">
            <div className="max-w-4xl w-full bg-base-100 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">
                    Payment Request: {formatCurrency(fiatAmount, fiatCurrency)}
                </h1>
                <p className="text-lg text-neutral-content mt-2">
                    Scan or tap to pay with your preferred cryptocurrency.
                </p>
            </div>

            <div className="sticky top-0 z-10 bg-base-100 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Payment Tabs">
                    {/* Wallet Transfer Tabs (one per chain) */}
                    {payableChains.map((chain) => {
                        const chainQRsCount = chain.tokens.filter(token => parseFloat(token.amount) > 0).length;
                        if (chainQRsCount === 0) return null;
                        return (
                            <>
                            <button
                                key={chain.name}
                                onClick={() => setActiveTab(chain.name)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === chain.name ? 'border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}>
                                <img src={getBlockchainLogo(chain.name)} alt={chain.name} className="h-5 w-5 mr-2 inline-block rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }} />
                                {chain.name} ({chainQRsCount})
                            </button>
                            </>
                        )
                    })}
                    {/* Combined Cross-Chain Swap Tab */}
                    {combinedSwapCount > 0 && (
                        <button
                            onClick={() => setActiveTab('combined-cross-chain-swap')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'combined-cross-chain-swap' ? 'border-b-2 border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}
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
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Pay with Wallet on {chain.name}</h3>
                        <div className="space-y-6">
                            {chain.tokens.filter((token) => parseFloat(token.amount) > 0).map((token) => (
                                <div key={token.symbol} className="p-4 bg-base-300 dark:bg-primary-900/50 rounded-lg">
                                    <h4 className="text-lg font-semibold mb-4 text-base-content">Pay {token.amount} {token.symbol}</h4>
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
                    <Combined1InchSwapQRCode order={order as OrderData} onBackToOrderDetails={() => { /* no-op */ }} />
                )}
                {activeTab === 'combined-cross-chain-swap' && !crossChainUrl && (
                    <p className="text-sm text-neutral-content">No valid combined cross-chain swap URL could be generated. Ensure at least one token is configured.</p>
                )}
            </div>
            </div>
        </div>
        </>
    );
}

