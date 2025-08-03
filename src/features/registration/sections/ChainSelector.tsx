import { useState, useMemo } from 'react';
import { type BlockchainData } from '../../../data/blockchains';
import nativeTokens from '../../../data/native-tokens.json';

interface ChainSelectorProps {
  supportedChains: BlockchainData[];
  configuredChainNames: string[]; // Prop to identify already configured chains
  onAddChains: (chainNames: string[]) => void;
}

const getBlockchainLogo = (chain: BlockchainData): string | undefined => {
    const idMap: { [key: string]: string } = {
        'bnb': 'binancecoin',
    };
    const lookupId = idMap[chain.id] || chain.id;
    const tokenInfo = nativeTokens.find(token => token.blockchain === lookupId);
    return tokenInfo?.logo;
};

const ChainItem = ({ chain, isSelected, isDisabled, onToggle }: { chain: BlockchainData, isSelected: boolean, isDisabled: boolean, onToggle: (name: string) => void }) => {
    const chainLogo = getBlockchainLogo(chain);
    
    return (
        <div
            className={`flex items-center p-3 rounded-lg transition ${
                isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : (isSelected ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-primary-800/50 cursor-pointer')
            }`}
            onClick={() => !isDisabled && onToggle(chain.name)}
        >
            <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {chainLogo ? (
                <img src={chainLogo} alt={chain.name} className="w-7 h-7 ml-3 mr-3 rounded-full object-contain" />
            ) : (
                <span className="flex items-center justify-center w-7 h-7 ml-3 mr-3 rounded-full bg-gray-200 dark:bg-primary-800 font-bold text-sm">
                    {chain.name.charAt(0)}
                </span>
            )}
            <span className="text-base-content font-medium">
                {chain.name}
                {isDisabled && <span className="ml-2 text-xs text-neutral-content">(Configured)</span>}
            </span>
        </div>
    );
};

export const ChainSelector = ({ supportedChains, configuredChainNames, onAddChains }: ChainSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChains, setSelectedChains] = useState<string[]>([]);

    const filteredAndSortableChains = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        
        // Filter out already configured chains and apply search term
        return supportedChains
            .filter(chain => !configuredChainNames.includes(chain.name))
            .filter(chain => chain.name.toLowerCase().includes(lowerCaseSearch))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [supportedChains, configuredChainNames, searchTerm]);

    const handleToggleSelection = (chainName: string) => {
        setSelectedChains(prev =>
            prev.includes(chainName) ? prev.filter(c => c !== chainName) : [...prev, chainName]
        );
    };

    const handleAdd = () => {
        onAddChains(selectedChains);
        setSelectedChains([]);
        setSearchTerm('');
    };
    
    return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
            <h3 className="text-lg font-semibold text-base-content mb-4">Select Supported Networks</h3>
            <div className="p-4 bg-gray-50 dark:bg-primary-900/50 rounded-lg">
                <input
                    type="text"
                    placeholder="Search blockchains..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-800 rounded-lg bg-base-200 text-gray-900 dark:text-white"
                />

                <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-2">
                    {filteredAndSortableChains.map((chain, index) => (
                         <ChainItem 
                            key={`chain-${chain.name}-${index}`} 
                            chain={chain} 
                            isSelected={selectedChains.includes(chain.name)} 
                            isDisabled={false} // Only eligible chains are in filteredAndSortableChains
                            onToggle={handleToggleSelection} 
                        />
                    ))}
                    {filteredAndSortableChains.length === 0 && searchTerm.length > 0 && (
                        <div className="text-center text-neutral-content">No matching blockchains found.</div>
                    )}
                    {filteredAndSortableChains.length === 0 && searchTerm.length === 0 && (
                        // This message only appears if there are no eligible chains to add at all
                        <div className="text-center text-neutral-content">All supported blockchains are already configured.</div>
                    )}
                </div>

                {selectedChains.length > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-neutral-content">{selectedChains.length} chain(s) selected</span>
                        <button
                            onClick={handleAdd}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition"
                        >
                            Add Chains
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
