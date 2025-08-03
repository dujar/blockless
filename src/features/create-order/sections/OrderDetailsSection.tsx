import { Link } from 'react-router-dom';
import type { useCreateOrderForm } from '../hooks/useCreateOrderForm';
import { getRiskInfo } from '../../../utils/token-helpers';
import blocklessLogo from '../../../assets/blockless.svg';

const formatCurrency = (amount: number, currencyCode: string) => {
    try {
        return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currencyCode }).format(amount);
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

type OrderDetailsProps = {
    form: ReturnType<typeof useCreateOrderForm>;
};

const OrderDetailsSection = ({ form }: OrderDetailsProps) => {
    const { order, setOrder, setFiatAmountInput, setStep, lastPriceUpdate, simulatePriceUpdate, loadingPrices } = form;

    if (!order) return null;

    return (
        <div className="bg-base-100 p-4 sm:p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base-content">
                    Order: {formatCurrency(order.fiatAmount, order.fiatCurrency)}
                </h1>
                <button onClick={() => { setOrder(null); setFiatAmountInput(''); setStep(1); }} className="text-neutral-content hover:underline">
                    ← New Order
                </button>
            </div>
            <div className="flex justify-between items-center text-sm text-neutral-content mb-6">
                <span>Last rates update: {formatTimeAgo(lastPriceUpdate)}</span>
                <button 
                onClick={simulatePriceUpdate} 
                className={`text-neutral-content hover:underline flex items-center ${loadingPrices ? 'opacity-50 cursor-not-allowed' : ''}`}
                 disabled={loadingPrices}>
                    {loadingPrices ? <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-content" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m7-10V4m0 2.291c1.135 1.041 2.524 1.838 4 2.291m-4-2.291V2m0 10l-2.291 3.709A8.001 8.001 0 0012 20h4M4 12h12m-8 4h8a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>}
                </button>
            </div>
            <p className="text-lg text-neutral-content mb-6">
                Customers can pay this amount using any of your configured cryptocurrencies:
            </p>
            <div className="space-y-6 mb-8">
                {order.chains.length > 0 ? order.chains.map(chain => (
                    <div key={chain.name} className="p-4 bg-base-300 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3 text-base-content">{chain.name} Payments</h3>
                        <p className="text-sm font-mono break-all text-neutral-content mb-4">Recipient Address: {chain.address}</p>
                        <div className="space-y-3">
                            {chain.tokens.filter(token => parseFloat(token.amount) > 0).map(token => {
                                const riskInfo = getRiskInfo(token.info.tags || []);
                                return (
                                    <div key={token.symbol} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-base-200 rounded-lg shadow-sm">
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <img src={token.info.logoURI || blocklessLogo} alt={token.info.symbol} className="h-6 w-6 mr-2 rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = blocklessLogo; }} />
                                            <span className="text-base font-medium text-base-content mr-2">Pay {token.amount} {token.symbol}</span>
                                            {riskInfo.level > 1 && <span className={`text-xs font-semibold ${riskInfo.color}`}>({riskInfo.label})</span>}
                                        </div>
                                        <span className="text-sm text-neutral-content">from {formatCurrency(order.fiatAmount, order.fiatCurrency)}</span>
                                    </div>
                                );
                            })}
                            {chain.tokens.filter(token => parseFloat(token.amount) > 0).length === 0 && (<p className="text-sm text-neutral-content">No convertible tokens configured for this chain.</p>)}
                        </div>
                    </div>
                )) : (<div className="text-center text-neutral-content p-4 border border-base-300 rounded-lg">No chains or tokens configured. Please go to <Link to="/register" className="text-gray-500 hover:underline">Register</Link> to set them up.</div>)}
            </div>
            <button onClick={() => setStep(3)} disabled={!order || order.chains.every(chain => chain.tokens.every(token => parseFloat(token.amount) <= 0))} className={`w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition ${(!order || order.chains.every(chain => chain.tokens.every(token => parseFloat(token.amount) <= 0))) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                Generate QR Codes
            </button>
        </div>
    );
};

export default OrderDetailsSection;
