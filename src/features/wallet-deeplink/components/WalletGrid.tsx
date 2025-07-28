import { WalletTile } from './WalletTile';
import type { Wallet } from '../../../data/wallets';

type WalletWithDeeplink = Wallet & { deeplink: string };

interface WalletGridProps {
  wallets: WalletWithDeeplink[];
  onWalletClick: (wallet: WalletWithDeeplink) => void;
}

export const WalletGrid = ({ wallets, onWalletClick }: WalletGridProps) => (
  <div className="p-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {wallets.map((wallet) => (
        <WalletTile
          key={wallet.name}
          wallet={wallet}
          onClick={() => onWalletClick(wallet)}
        />
      ))}
    </div>
  </div>
);
