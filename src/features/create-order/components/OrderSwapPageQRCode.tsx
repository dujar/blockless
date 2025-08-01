import { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from '../../../assets/blockless.svg';
import type { OrderData } from '../hooks/useCreateOrderForm';
import type { TokenInfoDto } from '../../../services/types';
import { QrCodeDisplayCard } from '../../../components/qr-code-display-card'; // Import the new QR display card

interface OrderSwapPageQRCodeProps {
    order: OrderData;
    onBackToOrderDetails: () => void;
}

export const OrderSwapPageQRCode = ({ order, onBackToOrderDetails }: OrderSwapPageQRCodeProps) => {
    const [isFullScreenQR, setIsFullScreenQR] = useState(false);
    
    const formatCurrency = (amount: number, currencyCode: string) => {
        try {
            return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currencyCode }).format(amount);
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

        const tokensForDisplay = Array.from(uniqueTokens.values()).slice(0, 3);

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: show a toast notification for copied link
        });
    };

    // The orderSwapUrl is generated in useCreateOrderForm and points to our internal /order page.
    const shareUrl = order.orderSwapUrl;
    const shareText = `Pay ${formatCurrency(order.fiatAmount, order.fiatCurrency)} using crypto via Blockless Swap!`;

    const socialShareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };

    if (!shareUrl) {
        return <p className="text-sm text-gray-500 dark:text-gray-400">No valid Order Swap URL could be generated. Ensure at least one token is configured.</p>;
    }

    return (
        <div className={isFullScreenQR ? 'fixed inset-0 z-50 bg-white dark:bg-primary-950 p-4 flex flex-col justify-between' : ''} onClick={() => isFullScreenQR && setIsFullScreenQR(false)}>
            {isFullScreenQR && (
                <div className="text-center mb-4" onClick={(e) => e.stopPropagation()}>
                    {renderPaymentSummary()}
                </div>
            )}
            <div className={`flex flex-col ${isFullScreenQR ? 'flex-grow justify-center' : 'space-y-8'}`} onClick={(e) => e.stopPropagation()}>
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Blockless Order Swap Page</h3>
                    <p className="text-gray-700 dark:text-gray-400 mb-2">Scan this QR code to open a dedicated payment page for this order.</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                        This QR code will redirect to a website (it is not a wallet deeplink).
                    </p>

                    {/* Main QR Code for Blockless Order Swap Page */}
                    <div className="flex justify-center mb-8">
                        <QrCodeDisplayCard
                            value={shareUrl}
                            mainLogo={blocklessLogo} // Use Blockless logo
                            logoWidth={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 48}
                            logoHeight={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 48}
                            title="Blockless Order Page"
                            subtitle={`Total: ${formatCurrency(order.fiatAmount, order.fiatCurrency)}`}
                            detail="Scan to pay"
                            errorCorrectionLevel="H"
                            isClickable={true}
                            onClick={() => setIsFullScreenQR(true)}
                            className="w-full max-w-sm"
                        />
                    </div>

                    {/* Shareable Link Section */}
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-primary-900 rounded-lg group w-full">
                        <div className="flex justify-between items-center text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                            <span>Shareable Link</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(shareUrl)}
                                    className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-primary-800 transition"
                                    title="Copy link"
                                >
                                    {/* Copy icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                </button>
                                <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                                    className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-primary-800 transition"
                                    title="Open in browser"
                                >
                                    {/* External link icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                </a>
                            </div>
                        </div>
                        <div className="text-xs font-mono break-all text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-primary-800/50 p-2 rounded">
                            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {shareUrl}
                            </a>
                        </div>
                        <div className="flex justify-center items-center space-x-4 mt-3">
                            <a href={socialShareLinks.twitter} target="_blank" rel="noopener noreferrer" title="Share on Twitter" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-gray-400">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.21-.669-3.924 4.727H2.25l8.14-9.29L2.25 2.25h3.308l5.21 6.69z"></path></svg>
                            </a>
                            <a href={socialShareLinks.telegram} target="_blank" rel="noopener noreferrer" title="Share on Telegram" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-gray-500">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5L10.3 14.7c-.2.2-.4.2-.6 0l-2.9-2.9c-.2-.2-.2-.4 0-.6l.7-.7c.2-.2.4-.2.6 0l2.3 2.3 5.4-5.4c.2-.2.4-.2.6 0l.7.7c.2.2.2.4 0 .6z"></path><path fillRule="evenodd" clipRule="evenodd" d="M18.75 3a.75.75 0 00-.515.228l-15 15a.75.75 0 00.515 1.272l1.664-.176a.75.75 0 00.74-.633L10 6l-1.5 5 8.75-5c.75-.4.75-.6.25-.9z" fill="currentColor"></path></svg>
                            </a>
                            <a href={socialShareLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-gray-500">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12.001 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm.914 15.656c-1.398.812-3.081 1.25-4.73 1.25-.091 0-.173-.008-.255-.015a.499.499 0 01-.482-.553l.426-2.557a.499.499 0 01.312-.416l2.164-1.082a.499.499 0 01.554.126l.89.89a.5.5 0 00.556.126l2.348-1.251c.642-.341 1.054-.724 1.251-1.127.199-.404.286-.814.286-1.127 0-.398-.106-.757-.312-1.066-.208-.31-.485-.561-.836-.752-.352-.191-.76-.286-1.228-.286-.445 0-.825.074-1.144.221-.32.148-.59.351-.812.607-.222.256-.395.53-.518.825a.499.499 0 01-.482.355l-2.083.084a.499.499 0 01-.527-.473c-.08-.8-.08-1.637.113-2.485.195-.848.583-1.57 1.164-2.166.582-.597 1.3-1.01 2.15-1.246.852-.236 1.74-.355 2.66-.355 1.503 0 2.87.359 4.102 1.077 1.233.718 2.227 1.705 2.986 2.961.758 1.256 1.137 2.666 1.137 4.234 0 1.597-.406 3.01-1.218 4.234-.812 1.224-1.859 2.164-3.14 2.812-1.282.648-2.673.972-4.174.972-.511 0-.992-.047-1.442-.142z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex ${isFullScreenQR ? 'mt-auto justify-center' : 'mt-6 justify-center'}`}>
                <button onClick={isFullScreenQR ? () => setIsFullScreenQR(false) : onBackToOrderDetails} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400" >
                    ← {isFullScreenQR ? 'Exit Fullscreen' : 'Back to Order Details'}
                </button>
            </div>
        </div>
    );
};

export default OrderSwapPageQRCode;
