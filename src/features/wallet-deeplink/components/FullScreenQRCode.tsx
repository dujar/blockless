import { QRCode } from 'react-qrcode-logo';
import type { Wallet } from '../../../data/wallets';
import blocklessLogo from '../../../assets/blockless.svg'; // Import blockless logo for fallback
import { useState } from 'react'; // Import useState

type WalletWithDeeplink = Wallet & { deeplink: string };

interface FullScreenQRCodeProps {
  wallet: WalletWithDeeplink;
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
  fiatAmount: number; // New: Fiat amount from the order
  fiatCurrency: string; // New: Fiat currency from the order
  genericSwapUrl: string | null; // New: The generic Blockless swap URL, now can be null
  onClose: () => void;
}

export const FullScreenQRCode = ({ wallet, blockchainName, tokenSymbol, amount, recipientAddress, fiatAmount, fiatCurrency, genericSwapUrl, onClose }: FullScreenQRCodeProps) => {
    const [copiedDeeplink, setCopiedDeeplink] = useState(false);
    const [copiedGenericLink, setCopiedGenericLink] = useState(false); // New state for generic link

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
    const genericLinkShareText = `Pay ${amount} ${tokenSymbol} (${formatCurrency(fiatAmount, fiatCurrency)}) to ${recipientAddress} on ${blockchainName} via Blockless Swap.`;

    const socialDeeplinkShareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(deeplinkShareText)}&url=${encodeURIComponent(wallet.deeplink)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(wallet.deeplink)}&text=${encodeURIComponent(deeplinkShareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(deeplinkShareText + ' ' + wallet.deeplink)}`,
    };

    const socialGenericLinkShareLinks = genericSwapUrl ? {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(genericLinkShareText)}&url=${encodeURIComponent(genericSwapUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(genericSwapUrl)}&text=${encodeURIComponent(genericLinkShareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(genericLinkShareText + ' ' + genericSwapUrl)}`,
    } : null;

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50 cursor-pointer p-4"
            onClick={onClose}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Pay {amount} {tokenSymbol}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                        from {formatCurrency(fiatAmount, fiatCurrency)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Scan with {wallet.name}
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="p-2 bg-white rounded-lg border-4 border-primary-500">
                        <QRCode
                            value={wallet.deeplink}
                            size={256}
                            logoImage={wallet.logo || blocklessLogo} // Use wallet logo, fallback to blockless
                            logoWidth={64}
                            logoHeight={64}
                            logoOpacity={1} // Ensure logo is fully opaque
                            removeQrCodeBehindLogo={true} // ensure logo is clearly visible
                            logoPadding={2}
                            logoPaddingStyle="circle"
                            qrStyle="squares"
                        />
                    </div>
                </div>

                <div className="text-center space-y-2 text-gray-800 dark:text-gray-300 text-sm">
                    <p className="break-all font-mono">
                        Blockchain: <span className="font-semibold">{blockchainName}</span>
                    </p>
                    <p className="break-all font-mono">
                        Recipient: <span className="font-semibold">{recipientAddress}</span>
                    </p>
                </div>
                
                {/* Wallet-specific Deeplink Section */}
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg group w-full">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                        <span>{wallet.name} Deeplink</span>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => copyToClipboard(wallet.deeplink, setCopiedDeeplink)}
                                className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Copy deeplink"
                            >
                                {copiedDeeplink ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                )}
                            </button>
                            <a href={wallet.deeplink} target="_blank" rel="noopener noreferrer"
                                className="p-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Open deeplink"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            </a>
                        </div>
                    </div>
                    <div className="text-xs font-mono break-all text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700/50 p-2 rounded">
                        <a href={wallet.deeplink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {wallet.deeplink}
                        </a>
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-3">
                        <a href={socialDeeplinkShareLinks.twitter} target="_blank" rel="noopener noreferrer" title="Share on Twitter" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.21-.669-3.924 4.727H2.25l8.14-9.29L2.25 2.25h3.308l5.21 6.69z"></path></svg>
                        </a>
                        <a href={socialDeeplinkShareLinks.telegram} target="_blank" rel="noopener noreferrer" title="Share on Telegram" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5L10.3 14.7c-.2.2-.4.2-.6 0l-2.9-2.9c-.2-.2-.2-.4 0-.6l.7-.7c.2-.2.4-.2.6 0l2.3 2.3 5.4-5.4c.2-.2.4-.2.6 0l.7.7c.2.2.2.4 0 .6z"></path><path fillRule="evenodd" clipRule="evenodd" d="M18.75 3a.75.75 0 00-.515.228l-15 15a.75.75 0 00.515 1.272l1.664-.176a.75.75 0 00.74-.633L10 6l-1.5 5 8.75-5c.75-.4.75-.6.25-.9z" fill="currentColor"></path></svg>
                        </a>
                        <a href={socialDeeplinkShareLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12.001 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm.914 15.656c-1.398.812-3.081 1.25-4.73 1.25-.091 0-.173-.008-.255-.015a.499.499 0 01-.482-.553l.426-2.557a.499.499 0 01.312-.416l2.164-1.082a.499.499 0 01.554.126l.89.89a.5.5 0 00.556.126l2.348-1.251c.642-.341 1.054-.724 1.251-1.127.199-.404.286-.814.286-1.127 0-.398-.106-.757-.312-1.066-.208-.31-.485-.561-.836-.752-.352-.191-.76-.286-1.228-.286-.445 0-.825.074-1.144.221-.32.148-.59.351-.812.607-.222.256-.395.53-.518.825a.499.499 0 01-.482.355l-2.083.084a.499.499 0 01-.527-.473c-.08-.8-.08-1.637.113-2.485.195-.848.583-1.57 1.164-2.166.582-.597 1.3-1.01 2.15-1.246.852-.236 1.74-.355 2.66-.355 1.503 0 2.87.359 4.102 1.077 1.233.718 2.227 1.705 2.986 2.961.758 1.256 1.137 2.666 1.137 4.234 0 1.597-.406 3.01-1.218 4.234-.812 1.224-1.859 2.164-3.14 2.812-1.282.648-2.673.972-4.174.972-.511 0-.992-.047-1.442-.142z"/></svg>
                        </a>
                    </div>
                </div>

                {genericSwapUrl && (
                    <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg group w-full">
                        <div className="flex justify-between items-center text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                            <span>Universal Swap Link</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(genericSwapUrl, setCopiedGenericLink)}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Copy universal swap link"
                                >
                                    {copiedGenericLink ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                    )}
                                </button>
                                <a href={genericSwapUrl} target="_blank" rel="noopener noreferrer"
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Open universal swap link"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                </a>
                            </div>
                        </div>
                        <div className="text-xs font-mono break-all text-primary-900 dark:text-primary-100 bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                            <a href={genericSwapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {genericSwapUrl}
                            </a>
                        </div>
                        <div className="flex justify-center items-center space-x-4 mt-3">
                            <a href={socialGenericLinkShareLinks?.twitter} target="_blank" rel="noopener noreferrer" title="Share on Twitter" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.21-.669-3.924 4.727H2.25l8.14-9.29L2.25 2.25h3.308l5.21 6.69z"></path></svg>
                            </a>
                            <a href={socialGenericLinkShareLinks?.telegram} target="_blank" rel="noopener noreferrer" title="Share on Telegram" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5L10.3 14.7c-.2.2-.4.2-.6 0l-2.9-2.9c-.2-.2-.2-.4 0-.6l.7-.7c.2-.2.4-.2.6 0l2.3 2.3 5.4-5.4c.2-.2.4-.2.6 0l.7.7c.2.2.2.4 0 .6z"></path><path fillRule="evenodd" clipRule="evenodd" d="M18.75 3a.75.75 0 00-.515.228l-15 15a.75.75 0 00.515 1.272l1.664-.176a.75.75 0 00.74-.633L10 6l-1.5 5 8.75-5c.75-.4.75-.6.25-.9z" fill="currentColor"></path></svg>
                            </a>
                            <a href={socialGenericLinkShareLinks?.whatsapp} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp" className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12.001 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm.914 15.656c-1.398.812-3.081 1.25-4.73 1.25-.091 0-.173-.008-.255-.015a.499.499 0 01-.482-.553l.426-2.557a.499.499 0 01.312-.416l2.164-1.082a.499.499 0 01.554.126l.89.89a.5.5 0 00.556.126l2.348-1.251c.642-.341 1.054-.724 1.251-1.127.199-.404.286-.814.286-1.127 0-.398-.106-.757-.312-1.066-.208-.31-.485-.561-.836-.752-.352-.191-.76-.286-1.228-.286-.445 0-.825.074-1.144.221-.32.148-.59.351-.812.607-.222.256-.395.53-.518.825a.499.499 0 01-.482.355l-2.083.084a.499.499 0 01-.527-.473c-.08-.8-.08-1.637.113-2.485.195-.848.583-1.57 1.164-2.166.582-.597 1.3-1.01 2.15-1.246.852-.236 1.74-.355 2.66-.355 1.503 0 2.87.359 4.102 1.077 1.233.718 2.227 1.705 2.986 2.961.758 1.256 1.137 2.666 1.137 4.234 0 1.597-.406 3.01-1.218 4.234-.812 1.224-1.859 2.164-3.14 2.812-1.282.648-2.673.972-4.174.972-.511 0-.992-.047-1.442-.142z"/></svg>
                            </a>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={onClose}
                className="mt-6 px-4 py-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
            >
                ← Close
            </button>
        </div>
    );
};

