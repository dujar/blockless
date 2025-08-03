
import React from 'react';
import { QrCodeDisplayCard } from './qr-code-display-card';
import { useWalletDeeplinks } from '../features/wallet-deeplink/hooks/useWalletDeeplinks';
import type { MerchantConfig } from '../types';
import type { TokenInfo } from '../data/tokens';
import type { BlockchainData } from '../data/blockchains';
import blocklessLogo from '../assets/blockless.svg';

interface WalletTransferQRCodeProps {
  chain: BlockchainData;
  token: TokenInfo;
  config: MerchantConfig;
}

export const WalletTransferQRCode: React.FC<WalletTransferQRCodeProps> = ({ chain, token, config }) => {
  const recipientAddress = (config.wallets as { [key: string]: string })[chain.id];

  const { applicableWallets } = useWalletDeeplinks({
    blockchainName: chain.name,
    tokenSymbol: token.symbol,
    amount: '0.01', // Default amount, can be made dynamic later
    recipientAddress,
  });

  const isWalletDetected = applicableWallets.length > 0;
  const deeplink = isWalletDetected ? applicableWallets[0].deeplink : 'N/A';
  const mainLogo = isWalletDetected ? applicableWallets[0].logo : blocklessLogo;
  const detail = isWalletDetected ? `Pay with ${applicableWallets[0].name}` : 'No wallet detected';
  const chainIcon = `/src/assets/${chain.icon}.svg`;

  return (
    <QrCodeDisplayCard
      value={deeplink}
      mainLogo={mainLogo}
      overlayLogo={chainIcon}
      title={`${chain.name}`}
      subtitle={token.symbol}
      detail={detail}
      isDisabled={!isWalletDetected}
      disabledMessage="No current wallet supports this chain."
      tooltipText={`Pay with ${token.symbol} on ${chain.name}`}
    />
  );
};
