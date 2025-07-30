import { useState } from 'react';
import { useWalletDeeplinks } from './hooks/useWalletDeeplinks';
import { WalletGrid } from './components/WalletGrid';
import { FullScreenQRCode } from './components/FullScreenQRCode';
import type { Wallet } from '../../data/wallets';

type WalletWithDeeplink = Wallet & { deeplink: string };

interface WalletDeeplinkQRsProps {
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
  fiatAmount: number; // New prop
  fiatCurrency: string; // New prop
  genericSwapUrl: string; // New prop to pass the generic swap URL
}

export const WalletDeeplinkQRs = ({ blockchainName, tokenSymbol, amount, recipientAddress, fiatAmount, fiatCurrency, genericSwapUrl }: WalletDeeplinkQRsProps) => {
  const [selectedWallet, setSelectedWallet] = useState<WalletWithDeeplink | null>(null);
  const { chain, token, applicableWallets } = useWalletDeeplinks({
    blockchainName,
    tokenSymbol,
    amount,
    recipientAddress,
  });

  if (!chain) {
    return <div className="text-red-500 dark:text-red-400 p-4 text-center">Unsupported blockchain selected.</div>;
  }

  if (!token) {
    return <div className="text-red-500 dark:text-red-400 p-4 text-center">Unsupported token for this blockchain.</div>;
  }

  const handleWalletClick = (wallet: WalletWithDeeplink) => {
    setSelectedWallet(wallet);
  };

  const handleBackClick = () => {
    setSelectedWallet(null);
  };

  if (selectedWallet) {
    return (
      <FullScreenQRCode 
        wallet={selectedWallet} 
        blockchainName={blockchainName}
        tokenSymbol={tokenSymbol}
        amount={amount}
        recipientAddress={recipientAddress}
        fiatAmount={fiatAmount} // Pass fiatAmount
        fiatCurrency={fiatCurrency} // Pass fiatCurrency
        genericSwapUrl={genericSwapUrl} // Pass genericSwapUrl
        onClose={handleBackClick} 
      />
    );
  }

  return (
    <WalletGrid wallets={applicableWallets} onWalletClick={handleWalletClick} />
  );
};

export default WalletDeeplinkQRs;

