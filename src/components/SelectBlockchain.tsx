import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blockchainData } from '../data/blockchains';
import { TokenService } from '../services/token-service'; // Import TokenService
import { getBlockchainLogo } from '../utils/token-helpers'; // Import the new utility


const tokenService = new TokenService();

interface SelectBlockchainProps {
  onSelect: (chain: string) => void;
  onBack: () => void;
  onDisconnect: () => void;
  selectedChain: string | null;
}

export const SelectBlockchain = ({ onSelect, onBack, onDisconnect, selectedChain }: SelectBlockchainProps) => {
  // Fetch supported chain IDs from 1inch API
  const { data: supportedChainIds, isLoading, error } = useQuery({
    queryKey: ['supportedChainIds'],
    queryFn: () => tokenService.getSupportedChains(),
  });

  const availableChains = useMemo(() => {
    if (!supportedChainIds) return []; // Return empty if data not loaded

    // Filter local blockchainData by the supported chain IDs from the API
    // Ensure only EVM chains are shown as per existing logic in useRegistrationForm for now
    return blockchainData.filter(chain => 
      chain.isEVM && chain.chainId && supportedChainIds.includes(chain.chainId)
    );
  }, [supportedChainIds]);

  // State to handle image loading errors for blockchain logos
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  const handleImageError = (chainId: number | null, chainName: string) => {
    const key = `${chainId || 'no-id'}-${chainName}`;
    setImgErrorMap(prev => ({ ...prev, [key]: true }));
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Blockchain</h2>
      
      {isLoading && <p className="text-gray-500 dark:text-gray-400">Loading supported blockchains...</p>}
      {error && <p className="text-red-500 dark:text-red-400">Error loading supported blockchains. Please try again later.</p>}
      {!isLoading && !error && availableChains.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No supported blockchains found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableChains.map((chain) => {
          const chainLogo = getBlockchainLogo(chain.name);
          const key = `${chain.chainId || 'no-id'}-${chain.name}`;
          return (
            <div
              key={chain.id}
              onClick={() => onSelect(chain.name)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition flex items-center ${
                selectedChain === chain.name
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              {imgErrorMap[key] || !chainLogo ? (
                <span className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300">
                  {chain.name.charAt(0)}
                </span>
              ) : (
                <img 
                  src={chainLogo} 
                  alt={chain.name} 
                  className="w-10 h-10 mr-3 rounded-full object-contain flex-shrink-0" 
                  onError={() => handleImageError(chain.chainId, chain.name)}
                />
              )}
              <span className="font-medium text-gray-900 dark:text-white">{chain.name}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

