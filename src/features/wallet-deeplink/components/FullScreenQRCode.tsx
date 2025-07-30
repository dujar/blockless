import { QRCode } from 'react-qrcode-logo';
import type { Wallet } from '../../../data/wallets';
import blocklessLogo from '../../../assets/blockless.svg'; // Import blockless logo for fallback

type WalletWithDeeplink = Wallet & { deeplink: string };

interface FullScreenQRCodeProps {
  wallet: WalletWithDeeplink;
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
  fiatAmount: number; // New: Fiat amount from the order
  fiatCurrency: string; // New: Fiat currency from the order
  onClose: () => void;
}

export const FullScreenQRCode = ({ wallet, blockchainName, tokenSymbol, amount, recipientAddress, fiatAmount, fiatCurrency, onClose }: FullScreenQRCodeProps) => {

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
                    <p className="text-gray-600 dark:text-gray-300">
                        from {formatCurrency(fiatAmount, fiatCurrency)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Scan with {wallet.name}
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <div className="p-2 bg-white rounded-lg border-4 border-blue-500">
                        <QRCode
                            value={wallet.deeplink}
                            size={256}
                            logoImage={wallet.logo || blocklessLogo} // Use wallet logo, fallback to blockless
                            logoWidth={64}
                            logoHeight={64}
                        />
                    </div>
                </div>

                <div className="text-center space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <p className="break-all font-mono">
                        Blockchain: <span className="font-semibold">{blockchainName}</span>
                    </p>
                    <p className="break-all font-mono">
                        Recipient: <span className="font-semibold">{recipientAddress}</span>
                    </p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-6 px-4 py-2 text-blue-300 hover:text-blue-100 dark:hover:text-blue-400"
            >
                ← Close
            </button>
        </div>
    );
};

