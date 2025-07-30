import { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from '../../../assets/blockless.svg';
import WalletDeeplinkQRs from '../../wallet-deeplink/WalletDeeplinkQRs';

interface OrderDisplayProps {
    showQRCode: boolean;
    qrCodeUrl: string;
    formData: {
        blockchain: string;
        token: string;
        amount: string;
        targetAddress: string;
        fiatAmount: number;
        fiatCurrency: string;
    };
    onBackToForm: () => void;
}

const HowItWorks = () => (
    <div className="space-y-6">
        <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                <span className="text-primary-500 font-bold">1</span>
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
                <span className="text-primary-500 font-bold">2</span>
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
                <span className="text-primary-500 font-bold">3</span>
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

        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-2">
                Tip: Auto-fill from Wallet
            </h4>
            <p className="text-sm text-primary-700 dark:text-primary-300">
                Connect your wallet to automatically fill in your address and current blockchain.
            </p>
        </div>
    </div>
);

interface QRCodeDisplayProps {
    qrCodeUrl: string;
    formData: {
        blockchain: string;
        token: string;
        amount: string;
        targetAddress: string;
        fiatAmount: number;
        fiatCurrency: string;
    };
    onBackToForm: () => void;
}

const QRCodeDisplay = ({ qrCodeUrl, formData, onBackToForm }: QRCodeDisplayProps) => {
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
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="flex space-x-4" aria-label="Tabs">
                    <button
                        onClick={() => setQrMode('link')}
                        className={`px-3 py-2 font-medium text-sm rounded-t-lg ${qrMode === 'link' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Swap Link
                    </button>
                    <button
                        onClick={() => setQrMode('wallets')}
                        className={`px-3 py-2 font-medium text-sm rounded-t-lg ${qrMode === 'wallets' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Wallet Deeplinks
                    </button>
                </nav>
            </div>

            {qrMode === 'link' && (
                <div className={`flex flex-col ${isFullScreenQR ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : 'items-center'}`} onClick={() => isFullScreenQR && setIsFullScreenQR(false)}>
                    <div className={`${isFullScreenQR ? 'w-full h-full flex flex-col justify-between' : 'mb-6 p-6 bg-gray-100 dark:bg-gray-700/50 rounded-xl shadow-inner w-full max-w-md'}`} onClick={(e) => e.stopPropagation()}>
                        {isFullScreenQR && (
                            <div className="text-left text-gray-900 dark:text-white text-xl font-bold mb-4">
                                Blockchain: {formData.blockchain}
                            </div>
                        )}
                        <div className={`flex ${isFullScreenQR ? 'flex-col items-center justify-center p-4' : 'justify-center mb-4'}`}>
                            <div className="relative w-full flex justify-center">
                                <div
                                    className="border-4 border-primary-500 rounded-lg p-2 cursor-pointer bg-white"
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
                                        logoOpacity={1}
                                        removeQrCodeBehindLogo={true}
                                        logoPadding={2}
                                        logoPaddingStyle="circle"
                                        qrStyle="squares"
                                    />
                                </div>
                            </div>
                        </div>

                        {isFullScreenQR && (
                            <div className="mt-4 text-center text-gray-900 dark:text-white">
                                <p className="text-2xl font-bold mb-2">Amount: {formData.amount} {formData.token}</p>
                                <p className="text-lg font-mono break-all">Recipient: {formData.targetAddress}</p>
                            </div>
                        )}

                        {!isFullScreenQR && (
                            <>
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Swap Link Details</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Scan with a generic QR reader to open swap link.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blockchain</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.blockchain}</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Token</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.token}</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.amount}</span>
                                    </div>

                                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Recipient Address</div>
                                        <div className="text-xs font-mono break-all text-gray-900 dark:text-white">
                                            {formData.targetAddress}
                                        </div>
                                    </div>

                                    <div
                                        className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg group w-full"
                                    >
                                        <div className="flex justify-between items-center text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                                            <span>Shareable Link</span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => copyToClipboard(qrCodeUrl)}
                                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                                    title="Copy link"
                                                >
                                                    {copied ? (
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
                                                    onClick={() => handleOpenLink(qrCodeUrl)}
                                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                                    title="Open in browser"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono break-all text-primary-900 dark:text-primary-100 bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                                            <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {qrCodeUrl}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {qrMode === 'wallets' && (
                <WalletDeeplinkQRs
                    blockchainName={formData.blockchain}
                    tokenSymbol={formData.token}
                    amount={formData.amount}
                    recipientAddress={formData.targetAddress}
                    fiatAmount={formData.fiatAmount}
                    fiatCurrency={formData.fiatCurrency}
                    genericSwapUrl={qrCodeUrl} 
                />
            )}

            <div className={`flex ${isFullScreenQR ? 'fixed bottom-4 left-0 right-0 justify-center' : 'mt-4 justify-center'}`}>
                <button
                    onClick={isFullScreenQR ? () => setIsFullScreenQR(false) : onBackToForm}
                    className="px-4 py-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
                >
                    ← {isFullScreenQR ? 'Exit Fullscreen' : 'Back to Form'}
                </button>
            </div>
        </div>
    );
};

const OrderDisplay = ({ showQRCode, qrCodeUrl, formData, onBackToForm }: OrderDisplayProps) => {
    return (
        <div className="lg:order-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg shadow-dynamic">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {showQRCode ? 'Your Order' : 'How It Works'}
            </h2>

            {showQRCode ? (
                <QRCodeDisplay qrCodeUrl={qrCodeUrl} formData={formData} onBackToForm={onBackToForm} />
            ) : (
                <HowItWorks />
            )}
        </div>
    );
};

export default OrderDisplay;

