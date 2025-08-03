import type { UseRegistrationFormReturn } from '../hooks/useRegistrationForm';
import { ChainConfigCard } from './ChainConfigCard';
import { ChainSelector } from './ChainSelector';

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
  
  const configuredChainNames = chains.map(c => c.name);
  // Pass all supported chains and configured chains.
  // ChainSelector will filter what's eligible for *adding* based on configuredChainNames.

  const handleAddChains = (chainNames: string[]) => {
    chainNames.forEach(name => handleChainChange(name, true));
  };
  
  return (
    <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">2. Configure Blockchains & Wallets</h2>
      {wallet.isConnected && (
        <div className="mb-4 flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-success-content">
              Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)} on {wallet.chain?.name}
            </p>
            <button onClick={() => wallet.disconnect()} className="text-sm text-red-500 hover:underline">Disconnect</button>
        </div>
      )}
      <div className="space-y-6">
        {chains.map(chainConfig => {
            const chainInfo = supportedChains.find(c => c.name === chainConfig.name);
            if (!chainInfo) return null;
            return (
                <ChainConfigCard 
                    key={chainInfo.id}
                    chainInfo={chainInfo}
                    currentChainConfig={chainConfig}
                    addressValidity={addressValidity[chainInfo.name]}
                    onChainChange={handleChainChange}
                    onAddressChange={handleAddressChange}
                    onTokenChange={handleTokenChange}
                    onUseWallet={wallet.handleUseWallet}
                    wallet={wallet}
                />
            )
        })}
      </div>
      
      <ChainSelector 
        supportedChains={supportedChains} 
        configuredChainNames={configuredChainNames} 
        onAddChains={handleAddChains} 
      />
    </div>
  );
};
