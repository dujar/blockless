
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { QrCodeDisplayCard } from '../components/qr-code-display-card';
import { WalletTransfer } from './WalletTransfer';
import { blockchainData } from '../data/blockchains';
import { tokenData } from '../data/tokens';
import oneInchLogo from '../assets/1inch.svg';
import blocklessLogo from '../assets/blockless.svg';
import metamaskLogo from '../assets/metamask.svg'; // Import wallet icon
import type { MerchantConfig } from '../types';

interface QRCodeTabsProps {
  config: MerchantConfig | null;
}

export const QRCodeTabs: React.FC<QRCodeTabsProps> = ({ config }) => {
  const renderOrderSwapTab = () => (
    <div className="p-4 flex justify-center">
      <QrCodeDisplayCard
        value="https://swoop.exchange/swap"
        mainLogo={blocklessLogo}
        title="Order Swap"
        subtitle="Scan to initiate a swap"
        detail="Fixed internal transaction"
        errorCorrectionLevel="H"
      />
    </div>
  );

  const renderCrossChainSwapTab = () => {
    if (!config || !config.supportedChains || config.supportedChains.length === 0) {
      return <div className="p-4 text-center">No payment methods available.</div>;
    }
    const supportedChains = blockchainData.filter(chain => config!.supportedChains!.includes(chain.id));
    const qrCodes = supportedChains.flatMap(chain => {
      const supportedTokens = tokenData.filter(token => token.chainId === chain.chainId);
      return supportedTokens.map(token => (
        <QrCodeDisplayCard
          key={`${chain.id}-${token.symbol}`}
          value={`https://app.1inch.io/swap?dst=${chain.chainId}:${token.address}`}
          mainLogo={oneInchLogo}
          overlayLogo={`/src/assets/${chain.icon}.svg`}
          title={chain.name}
          subtitle={token.symbol}
          tooltipText={`Swap ${token.symbol} on ${chain.name} via 1inch`}
        />
      ));
    });
    return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">{qrCodes}</div>;
  };

  const renderWalletTransferTabs = () => {
    if (!config || !config.supportedChains || config.supportedChains.length === 0) {
      return <div className="p-4 text-center">No wallets configured.</div>;
    }
    const supportedChains = blockchainData.filter(chain => config!.supportedChains!.includes(chain.id) && (config!.wallets as { [key: string]: string })[chain.id]);

    return (
      <Tabs>
        <TabList className="sub-tab-list">
          {supportedChains.map(chain => (
            <Tab key={chain.id} className="sub-tab" selectedClassName="sub-tab--selected">
              <img src={`/src/assets/${chain.icon}.svg`} alt={`${chain.name} logo`} className="inline-block w-5 h-5 mr-2" />
              {chain.name}
            </Tab>
          ))}
        </TabList>
        {supportedChains.map(chain => (
          <TabPanel key={chain.id}>
            <WalletTransfer config={config} chain={chain} />
          </TabPanel>
        ))}
      </Tabs>
    );
  };

  const orderSwapCount = 1;
  const crossChainSwapCount = config?.supportedChains?.reduce((acc: number, chainId: string) => {
    return acc + tokenData.filter(token => token.chainId === blockchainData.find(c => c.id === chainId)?.chainId).length;
  }, 0) || 0;
  const walletTransferCount = config?.supportedChains?.filter(id => (config.wallets as { [key: string]: string })[id]).length || 0;

  return (
    <Tabs defaultIndex={2}>
      <TabList>
        <Tab>Order Swap ({orderSwapCount})</Tab>
        <Tab>Cross-Chain Swap ({crossChainSwapCount})</Tab>
        <Tab>
          <img src={metamaskLogo} alt="Wallet Icon" className="inline-block w-5 h-5 mr-2" />
          Wallet Transfer ({walletTransferCount})
        </Tab>
      </TabList>

      <TabPanel>{renderOrderSwapTab()}</TabPanel>
      <TabPanel>{renderCrossChainSwapTab()}</TabPanel>
      <TabPanel>{renderWalletTransferTabs()}</TabPanel>
    </Tabs>
  );
};
