import blocklessLogo from '../../../assets/blockless.svg'; // Import blockless logo for fallback
import { useState } from 'react'; // Import useState
import { QrCodeDisplayCard } from '../../../components/qr-code-display-card'; // Import the new component
import telegramLogo from '../../../assets/telegram.svg'; // Import Telegram logo
import whatsappLogo from '../../../assets/whatsapp.png'; // Import WhatsApp logo
import xLogo from '../../../assets/x.svg'; // Import X (Twitter) logo
import facebookLogo from '../../../assets/facebook.png'; // Import Facebook logo
import discordLogo from '../../../assets/discrod.svg'; // Import Discord logo

interface FullScreenQRCodeProps {
  wallet: { deeplink: string; name: string; logo: string; };
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
  fiatAmount: number; // New: Fiat amount from the order
  fiatCurrency: string; // New: Fiat currency from the order
  onClose: () => void;
}

export const FullScreenQRCode = ({ wallet, blockchainName, tokenSymbol, amount, recipientAddress, fiatAmount, fiatCurrency, onClose }: FullScreenQRCodeProps) => {
    const [copiedDeeplink, setCopiedDeeplink] = useState(false);

    const formatCurrency = (value: number, currencyCode: string) => {
        try {
            return new Intl.NumberFormat(navigator.language, {
                style: 'currency',
                currency: currencyCode,
            }).format(value);
        } catch (e) {
            console.error("Error formatting currency:", e);
            return `${value} ${currencyCode}`;
        }
    };

    const copyToClipboard = (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedState(true);
            setTimeout(() => setCopiedState(false), 2000);
        });
    };

    const deeplinkShareText = `Pay ${amount} ${tokenSymbol} (${formatCurrency(fiatAmount, fiatCurrency)}) to ${recipientAddress} on ${blockchainName} using ${wallet.name}.`;

    const socialDeeplinkShareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(deeplinkShareText)}&url=${encodeURIComponent(wallet.deeplink)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(wallet.deeplink)}&text=${encodeURIComponent(deeplinkShareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(deeplinkShareText + ' ' + wallet.deeplink)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wallet.deeplink)}&quote=${encodeURIComponent(deeplinkShareText)}`,
        // Share to a specific Discord channel as per user instruction
        discord: `https://discord.com/channels/554623348622098432/885830009930010625?message=${encodeURIComponent(deeplinkShareText + ' ' + wallet.deeplink)}`,
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50 cursor-pointer p-4"
            onClick={onClose}
        >
            <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-base-content mb-2">
                        Pay {amount} {tokenSymbol}
                    </h3>
                    <p className="text-neutral-content">
                        from {formatCurrency(fiatAmount, fiatCurrency)}
                    </p>
                    <p className="text-sm text-neutral-content mt-2">
                        Scan with {wallet.name}
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <QrCodeDisplayCard
                        value={wallet.deeplink}
                        mainLogo={wallet.logo || blocklessLogo}
                        logoWidth={64}
                        logoHeight={64}
                        errorCorrectionLevel="H" // Explicitly set to H
                        title="" // Title is handled by parent, not for the QR card itself
                        subtitle="" // Subtitle is handled by parent
                        detail="" // Detail is handled by parent
                        isClickable={true} // Not clickable in fullscreen mode
                        onClick={() => window.open(wallet.deeplink, '_blank')}
                    />
                </div>

                <div className="text-center space-y-2 text-neutral-content text-sm">
                    <p className="break-all font-mono">
                        Blockchain: <span className="font-semibold">{blockchainName}</span>
                    </p>
                    <p className="break-all font-mono">
                        Recipient: <span className="font-semibold">{recipientAddress}</span>
                    </p>
                </div>
                
                {/* Wallet-specific Deeplink Section */}
                <div className="mt-4 p-3 bg-base-300 dark:bg-primary-900 rounded-lg group w-full">
                    <div className="flex justify-between items-center text-sm font-medium text-base-content mb-1">
                        <span>{wallet.name} Deeplink</span>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => copyToClipboard(wallet.deeplink, setCopiedDeeplink)}
                                className="p-1 rounded-md text-neutral-content hover:bg-base-300 transition"
                                title="Copy deeplink"
                            >
                                {copiedDeeplink ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                )}
                            </button>
                            <a href={wallet.deeplink} target="_blank" rel="noopener noreferrer"
                                className="p-1 rounded-md text-neutral-content hover:bg-base-300 transition"
                                title="Open deeplink"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            </a>
                        </div>
                    </div>
                    {/* Removed max-w-sm to allow text to flow up to parent container */}
                    <div className="text-sm font-sans break-all text-base-content bg-base-200 p-3 rounded-lg shadow-inner">
                        <a href={wallet.deeplink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {wallet.deeplink}
                        </a>
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-3">
                        <a href={socialDeeplinkShareLinks.twitter} target="_blank" rel="noopener noreferrer" title="Share on X (Twitter)" className="text-neutral-content hover:text-info-content">
                            <img src={xLogo} alt="X (Twitter)" className="w-6 h-6" />
                        </a>
                        <a href={socialDeeplinkShareLinks.telegram} target="_blank" rel="noopener noreferrer" title="Share on Telegram" className="text-neutral-content hover:text-info-content">
                            <img src={telegramLogo} alt="Telegram" className="w-6 h-6" />
                        </a>
                        <a href={socialDeeplinkShareLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="text-neutral-content hover:text-success-content">
                            <img src={whatsappLogo} alt="WhatsApp" className="w-6 h-6" />
                        </a>
                        <a href={socialDeeplinkShareLinks.facebook} target="_blank" rel="noopener noreferrer" title="Share on Facebook" className="text-neutral-content hover:text-info-content">
                            <img src={facebookLogo} alt="Facebook" className="w-6 h-6" />
                        </a>
                        <a href={socialDeeplinkShareLinks.discord} target="_blank" rel="noopener noreferrer" title="Share on Discord" className="text-neutral-content hover:text-info-content">
                            <img src={discordLogo} alt="Discord" className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-6 px-4 py-2 text-neutral-content hover:text-base-content"
            >
                ← Close
            </button>
        </div>
    );
};
