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
  genericSwapUrl: string; // New: The generic Blockless swap URL
  onClose: () => void;
}

export const FullScreenQRCode = ({ wallet, blockchainName, tokenSymbol, amount, recipientAddress, fiatAmount, fiatCurrency, genericSwapUrl, onClose }: FullScreenQRCodeProps) => {
    const [copiedGenericLink, setCopiedGenericLink] = useState(false); // State for generic link copy
    const [showSocialShareOptions, setShowSocialShareOptions] = useState(false); // State for social share options

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

    const handleOpenLink = (url: string) => {
        window.open(url, '_blank');
    };

    const handleShareClick = () => {
        setShowSocialShareOptions(prev => !prev);
    };

    const shareOnSocialMedia = (platform: 'twitter' | 'facebook' | 'linkedin', url: string, text: string) => {
        if (navigator.share) {
            // Use Web Share API if available (typically on mobile)
            navigator.share({
                title: 'Blockless Swap Order',
                text: text,
                url: url,
            }).catch(console.error);
        } else {
            // Fallback for desktop or non-supporting browsers
            let shareUrl = '';
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent('Blockless Swap Order')}&summary=${encodeURIComponent(text)}`;
                    break;
                default:
                    return;
            }
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };

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

                {/* Generic Swap Link Section */}
                {genericSwapUrl && (
                    <div className="mt-6 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg group w-full">
                        <div className="flex justify-between items-center text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                            <span>Shareable Swap Link</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => copyToClipboard(genericSwapUrl, setCopiedGenericLink)}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Copy link"
                                >
                                    {copiedGenericLink ? (
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
                                    onClick={() => handleOpenLink(genericSwapUrl)}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Open in browser"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleShareClick}
                                    className="p-1 rounded-md text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition"
                                    title="Share"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186A.75.75 0 017.5 12h9.75a.75.75 0 00.75-.75V5.625m0 0a2.25 2.25 0 100 2.186M17.25 12V5.625m0 0H14.25m6.75 0H21M7.217 13.093A2.25 2.25 0 100 2.186m0 0v2.186m0-2.186A.75.75 0 017.5 12h9.75a.75.75 0 00.75-.75V5.625m0 0a2.25 2.25 0 100 2.186M17.25 12V5.625m0 0H14.25M6.75 18H4.5A2.25 2.25 0 012.25 15.75V9.486c0-.354.12-.695.342-.943L6.094 4.148A2.25 2.25 0 017.5 3h.375a2.25 2.25 0 012.25 2.25v.385m0 6.275v-.385M18.75 18H21a2.25 2.25 0 002.25-2.25V9.486c0-.354-.12-.695-.342-.943L18.906 4.148A2.25 2.25 0 0117.5 3h-.375a2.25 2.25 0 00-2.25 2.25v.385m0 6.275v-.385m0 0H9.75m0 0H7.5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-xs font-mono break-all text-primary-900 dark:text-primary-100 bg-primary-100 dark:bg-primary-900/30 p-2 rounded">
                            <a href={genericSwapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {genericSwapUrl}
                            </a>
                        </div>
                        {showSocialShareOptions && (
                            <div className="mt-2 flex justify-center space-x-3">
                                <button
                                    onClick={() => shareOnSocialMedia('twitter', genericSwapUrl, `Securely accept crypto payments for ${formatCurrency(fiatAmount, fiatCurrency)}! Powered by Blockless, this swap link enables seamless cross-chain transactions. #BlocklessSwap`)}
                                    className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.678 1.174H15.01V.014h-3.328l-3.364 4.542L2.7 0H.581L5.942 6.74l-5.36 7.643H.01l4.088-5.326L1.012 16H3.35L8.064 9.07l5.068 7.23H15.01L9.467 8.01 12.678 1.174zm-2.028 12.046L3.921 2.506H6.608l4.729 10.714h-2.028z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => shareOnSocialMedia('facebook', genericSwapUrl, `Simplify crypto payments with Blockless Swap! Accept any token from any chain. Learn more: ${genericSwapUrl} #BlocklessPayment`)}
                                    className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.979H9.93c-.994 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H8.625V16c3.823-.604 6.75-3.934 6.75-7.951z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => shareOnSocialMedia('linkedin', genericSwapUrl, `Effortlessly accept crypto payments for ${formatCurrency(fiatAmount, fiatCurrency)} via Blockless Swap. Seamless cross-chain transactions for your business. #CryptoPayments #Blockless`)}
                                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.539-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a.516.516 0 01.016-.025V6.169H6.618z"/>
                                    </svg>
                                </button>
                            </div>
                        )}
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

