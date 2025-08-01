import WalletDeeplinkQRs from '../../wallet-deeplink/WalletDeeplinkQRs';
import { CrossChainQRCodeDisplay } from '../components/CrossChainQRCodeDisplay';
import type { useCreateOrderForm } from '../hooks/useCreateOrderForm';
import { getTokenLogoURI } from '../../../utils/token-helpers';
import OneInchLogo from '../../../assets/1inch.svg';
import blocklessLogo from '../../../assets/blockless.svg';
import { encodeOrderToUrlParam, serializeOrderData } from '../../order-swap/lib/url-serializer'; // Import new serializer

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

    // Generate the new order swap URL for the new tab
    const serializedOrder = serializeOrderData(order);
    const encodedOrderParam = encodeOrderToUrlParam(serializedOrder);
    const orderSwapUrl = `${window.location.origin}/order?order=${encodedOrderParam}`;

    return (
        <div className="bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}</h1>
                <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-gray-500 hover:underline">New Order</button>
            </div>
            {/* Make tabs sticky on mobile */}
            <div className="sticky top-0 z-10 bg-white dark:bg-primary-950 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {order.chains.map((chain) => chain.tokens.some((token) => parseFloat(token.amount) > 0) && (
                        <button key={chain.name} onClick={() => setActiveTab(chain.name)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === chain.name ? 'border-gray-500 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            <img src={getTokenLogoURI('native', '', chain.name)} alt={chain.name} className="h-5 w-5 mr-2 inline-block rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }} />
                            {chain.name}
                        </button>
                    ))}
                    {/* The new "Order Swap" tab which links to the new dedicated order page */}
                    <button onClick={() => setActiveTab('order-swap')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'order-swap' ? 'border-b-2 border-gray-500 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <img src={blocklessLogo} alt="Blockless" className="h-5 w-5 mr-2 inline-block rounded-full" />
                        Order Swap
                    </button>
                </nav>
            </div>
            <div className="py-6">
                {order.chains.map((chain) => activeTab === chain.name && (
                    <div key={chain.name}>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pay with Wallet on {chain.name}</h3>
                        <div className="space-y-6">
                            {chain.tokens.filter((token) => parseFloat(token.amount) > 0).map((token) => (
                                <div key={token.symbol} className="p-4 bg-gray-100 dark:bg-primary-900/50 rounded-lg">
                                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pay {token.amount} {token.symbol}</h4>
                                    <WalletDeeplinkQRs blockchainName={chain.name} tokenSymbol={token.symbol} amount={token.amount} recipientAddress={chain.address} fiatAmount={order.fiatAmount} fiatCurrency={order.fiatCurrency} />
                                </div>
                            ))}
                            {chain.tokens.filter((token) => parseFloat(token.amount) > 0).length === 0 && (<p className="text-sm text-gray-500 dark:text-gray-400">No convertible tokens available for QR codes on this chain.</p>)}
                        </div>
                    </div>
                ))}
                {/* When 'Order Swap' tab is active, display the QR for the new orderSwapUrl */}
                {activeTab === 'order-swap' && (
                    <CrossChainQRCodeDisplay order={{ ...order, crossChainUrl: orderSwapUrl }} onBackToOrderDetails={() => setStep(2)} />
                )}
                {activeTab === 'order-swap' && !orderSwapUrl && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No valid Order Swap URL could be generated. Ensure at least one token is configured.</p>
                )}
            </div>
        </div>
    );
};

export default OrderQRCodeDisplaySection;

