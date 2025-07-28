import { QRCode } from 'react-qrcode-logo';
import type { Wallet } from '../../../data/wallets';

type WalletWithDeeplink = Wallet & { deeplink: string };

interface FullScreenQRCodeProps {
  wallet: WalletWithDeeplink;
  onClose: () => void;
}

export const FullScreenQRCode = ({ wallet, onClose }: FullScreenQRCodeProps) => (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50 cursor-pointer"
    onClick={onClose}
  >
    <div className="p-4 bg-white rounded-lg border border-gray-200 dark:border-gray-600" onClick={e => e.stopPropagation()}>
      <QRCode value={wallet.deeplink} size={256} logoImage={wallet.logo} logoWidth={64} logoHeight={64} />
    </div>
    <p className="mt-4 text-lg font-medium text-white">{wallet.name}</p>
  </div>
);
