
import React from 'react';
import { WalletTransferQRCode } from './WalletTransferQRCode';
import type { MerchantConfig } from '../types';
import type { BlockchainData } from '../data/blockchains';
import { tokenData } from '../data/tokens';

interface WalletTransferProps {
  config: MerchantConfig | null;
  chain: BlockchainData;
}

export const WalletTransfer: React.FC<WalletTransferProps> = ({ config, chain }) => {
  if (!config) {
    return <div className="p-4 text-center">Merchant configuration not loaded.</div>;
  }

  const supportedTokens = tokenData.filter(token => token.chainId === chain.chainId);

  if (supportedTokens.length === 0) {
    return <div className="p-4 text-center">No supported tokens for this chain.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {supportedTokens.map(token => (
        <WalletTransferQRCode key={`${chain.id}-${token.symbol}`} chain={chain} token={token} config={config} />
      ))}
    </div>
  );
};
