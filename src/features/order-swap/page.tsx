import { useState, useEffect } from 'react';
import { useOrderFromUrl } from './hooks/use-order-from-url';
import WalletDeeplinkQRs from '../../features/wallet-deeplink/WalletDeeplinkQRs';
import OneInchDirectAppQRCodes from '../../features/create-order/components/OneInchDirectAppQRCodes';
import OrderSwapPageQRCode from '../../features/create-order/components/OrderSwapPageQRCode';
import { getBlockchainLogo } from '../../utils/token-helpers';
import blocklessLogo from '../../assets/blockless.svg';
import OneInchLogo from '../../assets/1inch.svg';
import type { OrderData } from '../../features/create-order/hooks/useCreateOrderForm';


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
            // Determine the first valid tab to activate
            const payableChainsWithTokens = order.chains.filter(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));

            if (payableChainsWithTokens.length > 0) {
                // If there are direct wallet transfer options, default to that tab.
                setActiveTab('wallet-transfers');
            } else if (order.orderSwapUrl) {
                // If no direct transfers, but an internal order swap page exists, default to that.
                setActiveTab('order-swap');
            } else if (order.crossChainUrl) {
                // Otherwise, if a 1inch cross-chain URL exists, default to that.
                setActiveTab('cross-chain-swap');
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

    const { fiatAmount, fiatCurrency, chains, crossChainUrl, orderSwapUrl } = order;

    // Filter chains to only show those with at least one token with amount > 0
    const payableChains = chains.filter(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));

    // Calculate tab counts
    const walletTransferCount = payableChains.reduce((acc, chain) => acc + chain.tokens.filter(token => parseFloat(token.amount) > 0).length, 0);
    const internalOrderSwapCount = orderSwapUrl ? 1 : 0;
    const directOneInchSwapCount = crossChainUrl ? payableChains.reduce((acc, chain) => acc + chain.tokens.filter(token => parseFloat(token.amount) > 0).length, 0) : 0; // Each payable token generates a 1inch direct link

    return (
        <>
        <div className="flex justify-center">
            <div className="max-w-4xl w-full bg-base-100 p-4 sm:p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">
                    Payment Request: {formatCurrency(fiatAmount, fiatCurrency)}
                </h1>
                <p className="text-lg text-neutral-content mt-2">
                    Scan or tap to pay with your preferred cryptocurrency.
                </p>
            </div>

            <div className="sticky top-0 z-10 bg-base-100 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-4 overflow-x-auto w-full md:w-9/12 mx-auto" aria-label="Payment Tabs">
                    {/* Wallet Transfers Tab */}
                    {walletTransferCount > 0 && (
                        <button
                            onClick={() => setActiveTab('wallet-transfers')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'wallet-transfers' ? 'border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}>
                            &#x1F4BC; Wallet Transfers ({walletTransferCount})
                        </button>
                    )}
                    
                    {/* Order Swap Tab (Our internal page) */}
                    {internalOrderSwapCount > 0 && (
                        <button
                            onClick={() => setActiveTab('order-swap')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'order-swap' ? 'border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}
                        >
                            <img src={blocklessLogo} alt="Order Swap" className="h-5 w-5 mr-2 inline-block rounded-full" />
                            Order Swap ({internalOrderSwapCount})
                        </button>
                    )}

                    {/* Cross-Chain Swap Tab (Direct 1inch app links) */}
                    {directOneInchSwapCount > 0 && (
                        <button
                            onClick={() => setActiveTab('cross-chain-swap')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'cross-chain-swap' ? 'border-b-2 border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}
                        >
                            <img src={OneInchLogo} alt="1inch" className="h-5 w-5 mr-2 inline-block rounded-full" />
                            Cross-Chain Swap ({directOneInchSwapCount})
                        </button>
                    )}
                </nav>
            </div>

            <div className="py-6">
                {/* Wallet Transfers Content */}
                {activeTab === 'wallet-transfers' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Direct Wallet Transfers</h3>
                        <p className="text-neutral-content mb-4">
                            Scan with your wallet to send funds directly on the specified blockchain.
                        </p>
                        {payableChains.length > 0 ? (
                            payableChains.map((chainConfig) => (
                                <div key={chainConfig.name} className="p-4 bg-base-300 dark:bg-primary-900/50 rounded-lg">
                                    <h4 className="text-lg font-semibold mb-4 text-base-content flex items-center">
                                        <img src={getBlockchainLogo(chainConfig.name)} alt={chainConfig.name} className="h-6 w-6 mr-2 rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }} />
                                        {chainConfig.name} Payments
                                    </h4>
                                    <p className="text-sm font-mono break-all text-neutral-content mb-4">Recipient: {chainConfig.address}</p>
                                    <div className="space-y-4">
                                        {chainConfig.tokens.filter(token => parseFloat(token.amount) > 0).map((token) => (
                                            <div key={token.symbol}>
                                                <h5 className="text-base font-medium mb-2 text-base-content">Pay {token.amount} {token.symbol}</h5>
                                                <WalletDeeplinkQRs 
                                                    blockchainName={chainConfig.name} 
                                                    tokenSymbol={token.symbol} 
                                                    amount={token.amount} 
                                                    recipientAddress={chainConfig.address} 
                                                    fiatAmount={order.fiatAmount} 
                                                    fiatCurrency={order.fiatCurrency} 
                                                    isTransferType="direct-wallet" // Indicate this is a direct wallet transfer
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {chainConfig.tokens.filter(token => parseFloat(token.amount) > 0).length === 0 && (
                                        <p className="text-sm text-neutral-content">No convertible tokens available for direct wallet transfers on this chain.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-neutral-content">No chains or tokens configured for direct transfers.</p>
                        )}
                    </div>
                )}

                {/* Order Swap Content */}
                {activeTab === 'order-swap' && internalOrderSwapCount > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Internal Order Swap Page</h3>
                        {/* orderSwapUrl is now the correct short ID link reconstructed from URL */}
                        <OrderSwapPageQRCode order={{ ...order, orderSwapUrl: order.orderSwapUrl }} onBackToOrderDetails={() => { /* no-op for this page */ }} />
                    </div>
                )}
                {activeTab === 'order-swap' && internalOrderSwapCount === 0 && (
                    <p className="text-sm text-neutral-content">No valid internal order swap URL could be generated.</p>
                )}

                {/* Cross-Chain Swap Content (Direct 1inch App Links) */}
                {activeTab === 'cross-chain-swap' && directOneInchSwapCount > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Direct 1inch App Swap Links</h3>
                        <OneInchDirectAppQRCodes order={order as OrderData} />
                    </div>
                )}
                {activeTab === 'cross-chain-swap' && directOneInchSwapCount === 0 && (
                    <p className="text-sm text-neutral-content">No valid combined cross-chain swap URL could be generated. Ensure at least one token is configured.</p>
                )}

                {/* Default message if no active tab or data */}
                {!activeTab && (
                    <div className="text-center text-neutral-content p-4 border border-base-300 rounded-lg">
                        Select a tab above to view payment options.
                    </div>
                )}
            </div>
            </div>
        </div>
        </>
    );
}
