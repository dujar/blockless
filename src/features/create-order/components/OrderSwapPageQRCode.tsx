import { useState } from 'react';

import blocklessLogo from '../../../assets/blockless.svg';
import type { OrderData } from '../hooks/useCreateOrderForm';
import type { TokenInfoDto } from '../../../services/types';
import { QrCodeDisplayCard } from '../../../components/qr-code-display-card'; // Import the new QR display card
import telegramLogo from '../../../assets/telegram.svg'; // Import Telegram logo
import whatsappLogo from '../../../assets/whatsapp.png'; // Import WhatsApp logo
import xLogo from '../../../assets/x.svg'; // Import X (Twitter) logo
import facebookLogo from '../../../assets/facebook.png'; // Import Facebook logo
import discordLogo from '../../../assets/discrod.svg'; // Import Discord logo

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
            <div className="flex items-center text-base-content text-xl font-bold">
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
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        // Share to a specific Discord channel as per user instruction
        discord: `https://discord.com/channels/554623348622098432/885830009930010625?message=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };

    if (!shareUrl) {
        return <p className="text-sm text-neutral-content">No valid Order Swap URL could be generated. Ensure at least one token is configured.</p>;
    }

    return (
        <div className={isFullScreenQR ? 'fixed inset-0 z-50 bg-base-100 p-4 flex flex-col justify-between' : ''} onClick={() => isFullScreenQR && setIsFullScreenQR(false)}>
            {isFullScreenQR && (
                <div className="text-center mb-4" onClick={(e) => e.stopPropagation()}>
                    {renderPaymentSummary()}
                </div>
            )}
            <div className={`flex flex-col ${isFullScreenQR ? 'flex-grow justify-center' : 'space-y-8'}`} onClick={(e) => e.stopPropagation()}>
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-base-content">Blockless Order Swap Page</h3>
                    <p className="text-neutral-content mb-2">Scan this QR code to open a dedicated payment page for this order.</p>
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
                            errorCorrectionLevel="M" // Explicitly set to M
                            isClickable={true}
                            onClick={() => { if (isFullScreenQR) { window.open(shareUrl, '_blank'); } else { setIsFullScreenQR(true); } }}
                            className="w-full max-w-sm"
                        />
                    </div>

                    {/* Shareable Link Section */}
                    <div className="mt-4 p-3 bg-base-300 dark:bg-primary-900 rounded-lg group w-full">
                        <div className="flex justify-between items-center text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                            <span>Shareable Link</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(shareUrl)}
                                    className="p-1 rounded-md text-neutral-content hover:bg-base-300 transition"
                                    title="Copy link"
                                >
                                    {/* Copy icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                </button>
                                <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                                    className="p-1 rounded-md text-neutral-content hover:bg-base-300 transition"
                                    title="Open in browser"
                                >
                                    {/* External link icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                </a>
                            </div>
                        </div>
                        {/* Removed max-w-sm to allow text to flow up to parent container */}
                        <div className="text-sm font-sans break-all text-base-content bg-base-200 p-3 rounded-lg shadow-inner">
                            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {shareUrl}
                            </a>
                        </div>
                        <div className="flex justify-center items-center space-x-4 mt-3">
                            <a href={socialShareLinks.twitter} target="_blank" rel="noopener noreferrer" title="Share on X (Twitter)" className="text-neutral-content hover:text-info-content">
                                <img src={xLogo} alt="X (Twitter)" className="w-6 h-6" />
                            </a>
                            <a href={socialShareLinks.telegram} target="_blank" rel="noopener noreferrer" title="Share on Telegram" className="text-neutral-content hover:text-info-content">
                                <img src={telegramLogo} alt="Telegram" className="w-6 h-6" />
                            </a>
                            <a href={socialShareLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="text-neutral-content hover:text-success-content">
                                <img src={whatsappLogo} alt="WhatsApp" className="w-6 h-6" />
                            </a>
                            <a href={socialShareLinks.facebook} target="_blank" rel="noopener noreferrer" title="Share on Facebook" className="text-neutral-content hover:text-info-content">
                                <img src={facebookLogo} alt="Facebook" className="w-6 h-6" />
                            </a>
                            <a href={socialShareLinks.discord} target="_blank" rel="noopener noreferrer" title="Share on Discord" className="text-neutral-content hover:text-info-content">
                                <img src={discordLogo} alt="Discord" className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex ${isFullScreenQR ? 'mt-auto justify-center' : 'mt-6 justify-center'}`}>
                <button onClick={isFullScreenQR ? () => setIsFullScreenQR(false) : onBackToOrderDetails} className="px-4 py-2 text-neutral-content hover:text-base-content" >
                    ← {isFullScreenQR ? 'Exit Fullscreen' : 'Back to Order Details'}
                </button>
            </div>
        </div>
    );
};

export default OrderSwapPageQRCode;
