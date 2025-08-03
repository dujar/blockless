import { useState, useMemo } from 'react';
import { useWalletDeeplinks } from './hooks/useWalletDeeplinks';
import { QrCodeDisplayCard } from '../../components/qr-code-display-card'; // Import the new QR display card
import { FullScreenQRCode } from './components/FullScreenQRCode'; // Still used for fullscreen display
import type { Wallet } from '../../data/wallets'; // Keep Wallet type
import blocklessLogo from '../../assets/blockless.svg'; // Fallback logo

type WalletWithDeeplink = Wallet & { deeplink: string };

interface WalletDeeplinkQRsProps {
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
  fiatAmount: number;
  fiatCurrency: string;
  isTransferType: 'direct-wallet' | 'other'; // New prop to indicate type of transfer for logic
}

export const WalletDeeplinkQRs = ({ blockchainName, tokenSymbol, amount, recipientAddress, fiatAmount, fiatCurrency, isTransferType }: WalletDeeplinkQRsProps) => {
  const [selectedWallet, setSelectedWallet] = useState<WalletWithDeeplink | null>(null);
  const { chain, token, applicableWallets } = useWalletDeeplinks({
    blockchainName,
    tokenSymbol,
    amount,
    recipientAddress,
  });

  // Basic check for common injected wallets (MetaMask, Coinbase Wallet, Rabby)
  // This is a best-effort detection for "installed" wallets on desktop.
  // For mobile, it largely relies on the OS handling deeplinks if the app is installed.
  useMemo(() => {
    if (!chain || !token || applicableWallets.length === 0) return false;

    // Check for injected providers for EVM chains
    if (chain.isEVM && window.ethereum) {
      if (window.ethereum.isMetaMask || window.ethereum.isCoinbaseWallet || (window.ethereum as { isRabby?: boolean }).isRabby) {
        return true;
      }
    }
    // Check for Phantom on Solana (basic detection)
    if (chain.name === 'Solana' && (window as { phantom?: { solana?: unknown } }).phantom?.solana) {
      return true;
    }
    
    // For other wallets, if a deeplink is generated, we assume it's "supported"
    // from a link generation perspective. Actual "installation" cannot be reliably detected.
    // The disabled state is primarily for cases where no deeplink CAN be generated.
    return applicableWallets.length > 0;
  }, [chain, token, applicableWallets]);


  const handleWalletClick = (wallet: WalletWithDeeplink) => {
    setSelectedWallet(wallet);
  };

  const handleBackClick = () => {
    setSelectedWallet(null);
  };

  if (!chain) {
    return <div className="text-red-500 dark:text-red-400 p-4 text-center">Unsupported blockchain selected.</div>;
  }

  if (!token) {
    return <div className="text-red-500 dark:text-red-400 p-4 text-center">Unsupported token for this blockchain.</div>;
  }

  if (selectedWallet) {
    return (
      <FullScreenQRCode 
        wallet={selectedWallet} 
        blockchainName={blockchainName}
        tokenSymbol={tokenSymbol}
        amount={amount}
        recipientAddress={recipientAddress}
        fiatAmount={fiatAmount}
        fiatCurrency={fiatCurrency}
        onClose={handleBackClick} 
      />
    );
  }

  // Display specific wallet QRs if applicable wallets are found,
  // or a disabled QR if no wallets are applicable for this chain/token combination AND it's a direct-wallet transfer
  const shouldShowDisabledQr = isTransferType === 'direct-wallet' && applicableWallets.length === 0;

  if (shouldShowDisabledQr) {
      return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <QrCodeDisplayCard
                  value="N/A" // No actual value for a disabled QR
                  mainLogo={blocklessLogo}
                  title="Wallet Unavailable"
                  subtitle={`${blockchainName} / ${tokenSymbol}`}
                  detail="No compatible wallet detected for this chain."
                  isDisabled={true}
                  disabledMessage="No current wallet supports this chain."
                  className="col-span-full mx-auto max-w-sm"
              />
          </div>
      );
  }

  // Render clickable wallet tiles
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {applicableWallets.map((wallet) => (
        <QrCodeDisplayCard
          key={wallet.name}
          value={wallet.deeplink}
          mainLogo={wallet.logo}
          title={wallet.name}
          subtitle="Scan to pay"
          isClickable={true}
          onClick={() => handleWalletClick(wallet)}
          tooltipText={`Open ${wallet.name} to pay ${amount} ${tokenSymbol} on ${blockchainName}`}
          className="mx-auto max-w-xs sm:max-w-none p-4" // Adjusted padding for QR code display cards
        />
      ))}
    </div>
  );
};

export default WalletDeeplinkQRs;

