import { QRCode } from 'react-qrcode-logo';
import type { Wallet } from '../../../data/wallets';

type WalletWithDeeplink = Wallet & { deeplink: string };

interface WalletTileProps {
  wallet: WalletWithDeeplink;
  onClick: () => void;
}

export const WalletTile = ({ wallet, onClick }: WalletTileProps) => (
  <div
    className="flex flex-col items-center text-center cursor-pointer"
    onClick={onClick}
  >
    <div className="p-2 bg-white rounded-lg border border-gray-200 dark:border-gray-600">
      <QRCode value={wallet.deeplink} size={128} logoImage={wallet.logo} logoWidth={32} logoHeight={32} />
    </div>
    <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">{wallet.name}</p>
  </div>
);
