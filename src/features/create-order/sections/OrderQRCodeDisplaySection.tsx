import WalletDeeplinkQRs from '../../wallet-deeplink/WalletDeeplinkQRs';
import OrderSwapPageQRCode from '../components/OrderSwapPageQRCode'; // New component for our internal /order page QR
import type { useCreateOrderForm } from '../hooks/useCreateOrderForm';
import { getBlockchainLogo } from '../../../utils/token-helpers'; // For logos in tabs
import blocklessLogo from '../../../assets/blockless.svg'; // Re-using 1inch logo for clarity where the swap is powered from
import oneinchLogo from '../../../assets/1inch.svg'; // Re-using 1inch logo for clarity where the swap is powered from
import OneInchDirectAppQRCodes from '../components/OneInchDirectAppQRCodes';


const formatCurrency = (amount: number, currencyCode: string) => {
    try {
        return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currencyCode }).format(amount);
    } catch (e) {
        console.error("Error formatting currency:", e);
        return `${amount} ${currencyCode}`;
    }
};

type OrderQRCodeDisplayProps = {
    form: ReturnType<typeof useCreateOrderForm>;
};

const OrderQRCodeDisplaySection = ({ form }: OrderQRCodeDisplayProps) => {
    const { order, setOrder, setFiatAmountInput, setStep, activeTab, setActiveTab } = form;

    if (!order) return null;

    // Filter chains to only show those with at least one token with amount > 0
    const payableChains = order.chains.filter(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));

    // Calculate counts for tabs
    const walletTransferCount = payableChains.reduce((acc, chain) => acc + chain.tokens.filter(token => parseFloat(token.amount) > 0).length, 0);
    const orderSwapCount = order.orderSwapUrl ? 1 : 0;
    // Cross-chain swap count can be the sum of all tokens across all chains that have an amount > 0
    const crossChainSwapCount = payableChains.reduce((acc, chain) => acc + chain.tokens.filter(token => parseFloat(token.amount) > 0).length, 0);

    return (
        <div className="bg-base-100 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}</h1>
                <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-neutral-content hover:underline">New Order</button>
            </div>
            {/* Make tabs sticky on mobile */}
            <div className="sticky top-0 z-10 bg-base-100 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-4 overflow-x-auto w-full md:w-9/12 mx-auto" aria-label="Tabs">
                    {/* Wallet Transfers Tab */}
                    {walletTransferCount > 0 && (
                        <button
                            onClick={() => setActiveTab('wallet-transfers')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'wallet-transfers' ? 'border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}>
                            &#x1F4BC; Wallet Transfers ({walletTransferCount})
                        </button>
                    )}
                    
                    {/* Order Swap Tab (Our internal page) */}
                    {orderSwapCount > 0 && (
                        <button
                            onClick={() => setActiveTab('order-swap')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'order-swap' ? 'border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}
                        >
                            <img src={blocklessLogo} alt="Order Swap" className="h-5 w-5 mr-2 inline-block rounded-full" />
                            Order Swap ({orderSwapCount})
                        </button>
                    )}

                    {/* Cross-Chain Swap Tab (Direct 1inch app links) */}
                    {crossChainSwapCount > 0 && (
                        <button
                            onClick={() => setActiveTab('cross-chain-swap')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'cross-chain-swap' ? 'border-b-2 border-base-content text-neutral-content' : 'border-transparent text-neutral-content hover:text-base-content hover:border-base-300'}`}
                        >
                            <img src={oneinchLogo} alt="1inch" className="h-5 w-5 mr-2 inline-block rounded-full" />
                            Cross-Chain Swap ({crossChainSwapCount})
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
                {activeTab === 'order-swap' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Internal Order Swap Page</h3>
                        {/* orderSwapUrl is now a short ID link */}
                        <OrderSwapPageQRCode order={{ ...order, orderSwapUrl: order.orderSwapUrl }} onBackToOrderDetails={() => setStep(2)} />
                    </div>
                )}

                {/* Cross-Chain Swap Content (Direct 1inch App Links) */}
                {activeTab === 'cross-chain-swap' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 text-base-content">Direct 1inch App Swap Links</h3>
                        <OneInchDirectAppQRCodes order={order} />
                    </div>
                )}

                {/* Default message if no active tab or data */}
                {!activeTab && (
                    <div className="text-center text-neutral-content p-4 border border-base-300 rounded-lg">
                        Select a tab above to view payment options.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderQRCodeDisplaySection;

