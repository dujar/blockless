import { useState } from 'react';
import { ConnectWallet } from '../components/ConnectWallet';
import type { BlockchainData } from '../data/blockchains'; // Import blockchainData
import { blockchainData } from '../data/blockchains'; // Import blockchainData

const ConnectWalletPage = () => {
  const [activeTab, setActiveTab] = useState<string>(blockchainData[0]?.id || '');

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-base-content mb-4 text-center">Connect Your Wallet</h2>
      <p className="text-neutral-content mb-8 text-center">
        Connect your wallet to get started with Blockless Swap
      </p>
      <div className="tabs tabs-boxed grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {blockchainData.map((blockchain: BlockchainData) => (
          <a
            key={blockchain.id}
            className={`tab tab-lg ${activeTab === blockchain.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(blockchain.id)}
          >
            {blockchain.name}
          </a>
        ))}
      </div>
      <div className="mt-4">
        {blockchainData.map((blockchain: BlockchainData) => (
          <div
            key={blockchain.id}
            className={activeTab === blockchain.id ? 'block' : 'hidden'}
          >
            {/* Render content for each blockchain tab */}
            <ConnectWallet blockchain={blockchain} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectWalletPage;
