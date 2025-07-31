import { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from '../../../assets/blockless.svg';
import OneInchLogo from '../../../assets/1inch.svg'; // Import 1inch logo
import WalletDeeplinkQRs from '../../wallet-deeplink/WalletDeeplinkQRs';
import type { TokenInfo } from '../../../data/tokens';
import type { GetQuoteOutput } from '../../../services/types';

interface OrderDisplayProps {
    showQRCode: boolean;
    qrCodeUrl: string;
    formData: {
        blockchain: string;
        sourceToken: TokenInfo | null;
        amount: string;
        targetAddress: string;
        fiatAmount: number;
        fiatCurrency: string;
    };
    quoteData: GetQuoteOutput | null;
    isQuoteLoading: boolean;
    quoteError: string | null;
    onBackToForm: () => void;
}

const HowItWorks = () => (
    <div className="p-6 space-y-6">
        <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <span className="text-gray-500 font-bold">1</span>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Fill Order Details
                </h3>
                <p className="text-gray-700 dark:text-gray-400">
                    Enter the blockchain, token, amount, and recipient for your order.
                </p>
            </div>
        </div>

        <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <span className="text-gray-500 font-bold">2</span>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Generate Order
                </h3>
                <p className="text-gray-700 dark:text-gray-400">
                    Create a shareable swap link or wallet-specific QR codes.
                </p>
            </div>
        </div>

        <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <span className="text-gray-500 font-bold">3</span>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Share & Execute
                </h3>
                <p className="text-gray-700 dark:text-gray-400">
                    Share the link for a swap, or the QR codes for direct wallet payments.
                </p>
            </div>
        </div>

        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Tip: Auto-fill from Wallet
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
                Connect your wallet to automatically fill in your address and current blockchain.
            </p>
        </div>
    </div>
);

interface QRCodeDisplayProps {
    qrCodeUrl: string;
    formData: OrderDisplayProps['formData'];
    quoteData: GetQuoteOutput | null;
    isQuoteLoading: boolean;
    quoteError: string | null;
    onBackToForm: () => void;
}

const QRCodeDisplay = ({ qrCodeUrl, formData, quoteData, isQuoteLoading, quoteError, onBackToForm }: QRCodeDisplayProps) => {
    const [isFullScreenQR, setIsFullScreenQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrMode, setQrMode] = useState<'link' | 'wallets'>('link');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleOpenLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="p-6">
            <div className="sticky top-0 z-10 bg-white dark:bg-primary-950 border-b border-gray-200 dark:border-gray-800 mb-4">
                <nav className="flex space-x-4" aria-label="Tabs">
                    <button
                        onClick={() => setQrMode('link')}
                        className={`px-3 py-2 font-medium text-sm rounded-t-lg ${qrMode === 'link' ? 'border-b-2 border-gray-500 text-gray-600 dark:text-gray-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Swap Link
                    </button>
                    <button
                        onClick={() => setQrMode('wallets')}
                        className={`px-3 py-2 font-medium text-sm rounded-t-lg ${qrMode === 'wallets' ? 'border-b-2 border-gray-500 text-gray-600 dark:text-gray-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Wallet Deeplinks
                    </button>
                </nav>
            </div>

            {isQuoteLoading && <div className="text-center text-gray-500 p-4">Loading quote...</div>}
            {quoteError && <div className="text-center text-red-500 p-4">Error: {quoteError}</div>}

            {quoteData && qrMode === 'link' && (
                <div className={`flex flex-col ${isFullScreenQR ? 'fixed inset-0 z-50 bg-white dark:bg-primary-950 p-4' : 'items-center'}`} onClick={() => isFullScreenQR && setIsFullScreenQR(false)}>
                    <div className={`${isFullScreenQR ? 'w-full h-full flex flex-col justify-between' : 'mb-6 bg-gray-100 dark:bg-primary-900/50 rounded-xl shadow-inner w-full'}`} onClick={(e) => e.stopPropagation()}>
                        <div className={`p-6 flex ${isFullScreenQR ? 'flex-col items-center justify-center' : 'flex-col items-center'}`}>
                            <div
                                className="border-4 border-gray-500 rounded-lg p-2 cursor-pointer bg-white"
                                onClick={() => setIsFullScreenQR(true)}
                            >
                                <QRCode
                                    value={qrCodeUrl}
                                    size={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) : 192}
                                    quietZone={10}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    logoImage={blocklessLogo}
                                    logoWidth={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 48}
                                    logoHeight={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 48}
                                    removeQrCodeBehindLogo={true}
                                    logoPadding={2}
                                    logoPaddingStyle="circle"
                                />
                            </div>
                            <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400 text-sm justify-center">
                                <span className="mr-1">Powered by</span>
                                <img src={OneInchLogo} alt="1inch Logo" className="h-4 w-auto" />
                                <span className="ml-1 font-semibold">1inch Fusion+</span>
                            </div>
                        </div>

                        <div className="px-6 pb-6 text-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Quote Details</h3>
                            <div className="space-y-2 p-3 bg-white dark:bg-primary-900 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">You send:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(quoteData.srcTokenAmount).toFixed(6)} {formData.sourceToken?.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Recipient gets:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(quoteData.dstTokenAmount).toFixed(6)} {quoteData.prices.usd.dstToken ? '...' : ''}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 group w-full rounded-b-xl">
                            <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span>Shareable Link</span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => copyToClipboard(qrCodeUrl)}
                                        className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                        title="Copy link"
                                    >
                                        {copied ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                        )}
                                    </button>
                                    <button onClick={() => handleOpenLink(qrCodeUrl)} className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition" title="Open in browser">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs font-mono break-all text-gray-900 dark:text-gray-100 bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                                <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{qrCodeUrl}</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {qrMode === 'wallets' && (
                <WalletDeeplinkQRs
                    blockchainName={formData.blockchain}
                    tokenSymbol={formData.sourceToken?.symbol ?? ''}
                    amount={formData.amount}
                    recipientAddress={formData.targetAddress}
                    fiatAmount={formData.fiatAmount}
                    fiatCurrency={formData.fiatCurrency}
                />
            )}

            <div className={`flex ${isFullScreenQR ? 'fixed bottom-4 left-0 right-0 justify-center' : 'mt-4 justify-center'}`}>
                <button
                    onClick={isFullScreenQR ? () => setIsFullScreenQR(false) : onBackToForm}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                >
                    ← {isFullScreenQR ? 'Exit Fullscreen' : 'Back to Form'}
                </button>
            </div>
        </div>
    );
};

const OrderDisplay = ({ showQRCode, qrCodeUrl, formData, quoteData, isQuoteLoading, quoteError, onBackToForm }: OrderDisplayProps) => {
    return (
        <div className="lg:order-1 bg-white dark:bg-primary-950 rounded-2xl shadow-lg shadow-dynamic">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 px-6 pt-6">
                {showQRCode ? 'Your Order' : 'How It Works'}
            </h2>

            {showQRCode ? (
                <QRCodeDisplay 
                    qrCodeUrl={qrCodeUrl} 
                    formData={formData} 
                    quoteData={quoteData} 
                    isQuoteLoading={isQuoteLoading} 
                    quoteError={quoteError} 
                    onBackToForm={onBackToForm} 
                />
            ) : (
                <HowItWorks />
            )}
        </div>
    );
};

export default OrderDisplay;
