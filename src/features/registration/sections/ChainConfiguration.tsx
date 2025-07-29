import type { UseRegistrationFormReturn } from '../hooks/useRegistrationForm';
import { ChainConfigCard } from './ChainConfigCard';

interface ChainConfigurationProps {
  form: UseRegistrationFormReturn;
}

export const ChainConfiguration = ({ form }: ChainConfigurationProps) => {
  const { 
    supportedChains, 
    chains, 
    addressValidity,
    handleChainChange,
    handleAddressChange,
    handleTokenChange,
    wallet,
  } = form;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. Configure Blockchains & Wallets</h2>
      {wallet.isConnected && (
        <div className="mb-4 flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)} on {wallet.chain?.name}
            </p>
            <button onClick={() => wallet.disconnect()} className="text-sm text-red-500 hover:underline">Disconnect</button>
        </div>
      )}
      <div className="space-y-6">
        {supportedChains.map(chainInfo => (
            <ChainConfigCard 
                key={chainInfo.id}
                chainInfo={chainInfo}
                currentChainConfig={chains.find(c => c.name === chainInfo.name)}
                addressValidity={addressValidity[chainInfo.name]}
                onChainChange={handleChainChange}
                onAddressChange={handleAddressChange}
                onTokenChange={handleTokenChange}
                onUseWallet={wallet.handleUseWallet}
                wallet={wallet}
            />
        ))}
      </div>
    </div>
  );
};
