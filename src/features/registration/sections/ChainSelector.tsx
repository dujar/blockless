import { useState, useMemo } from 'react';
import { type BlockchainData } from '../../../data/blockchains';

interface ChainSelectorProps {
  supportedChains: BlockchainData[];
  configuredChainNames: string[]; // Prop to identify already configured chains
  onAddChains: (chainNames: string[]) => void;
}

// Map parent chains to their direct L2s/related chains for display grouping.
// This is for UI organization, not strict technical L1/L2 definition.
const CHAIN_GROUPING: Record<string, string[]> = {
  "Ethereum": ["Arbitrum", "Base", "Linea", "Optimism", "zkSync Era"],
};

const ChainItem = ({ chain, isSelected, isDisabled, onToggle }: { chain: BlockchainData, isSelected: boolean, isDisabled: boolean, onToggle: (name: string) => void }) => (
    <div
        className={`flex items-center p-3 rounded-lg transition ${
            isDisabled 
                ? 'opacity-50 cursor-not-allowed' 
                : (isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer')
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
        <span className="flex items-center justify-center w-7 h-7 ml-3 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 font-bold text-sm">
            {chain.name.charAt(0)}
        </span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">
            {chain.name}
            {isDisabled && <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Configured)</span>}
        </span>
    </div>
);

export const ChainSelector = ({ supportedChains, configuredChainNames, onAddChains }: ChainSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChains, setSelectedChains] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const displayableChains = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const finalGroups: { chain: BlockchainData, children: BlockchainData[] }[] = [];
        const finalIndependents: BlockchainData[] = [];
        const processedChainNames = new Set<string>();

        // 1. Process groups (parents and their eligible children)
        Object.keys(CHAIN_GROUPING).forEach(parentName => {
            const parentChain = supportedChains.find(c => c.name === parentName);
            if (parentChain && !configuredChainNames.includes(parentChain.name)) {
                const eligibleChildren = CHAIN_GROUPING[parentName]
                    .map(childName => supportedChains.find(c => c.name === childName))
                    .filter((c): c is BlockchainData => !!c && !configuredChainNames.includes(c.name));

                if (eligibleChildren.length > 0) {
                    finalGroups.push({ chain: parentChain, children: eligibleChildren });
                    processedChainNames.add(parentChain.name);
                    eligibleChildren.forEach(child => processedChainNames.add(child.name));
                }
            }
        });

        // 2. Process independent chains (those not part of any group and not configured)
        supportedChains.forEach(chain => {
            if (!configuredChainNames.includes(chain.name) && !processedChainNames.has(chain.name)) {
                finalIndependents.push(chain);
                processedChainNames.add(chain.name);
            }
        });

        // Apply search term filtering
        const filteredGroups = finalGroups
            .filter(group => 
                group.chain.name.toLowerCase().includes(lowerCaseSearch) || 
                group.children.some(c => c.name.toLowerCase().includes(lowerCaseSearch))
            )
            .map(group => ({
                chain: group.chain,
                children: group.children.filter(c => c.name.toLowerCase().includes(lowerCaseSearch)),
            }))
            .filter(group => 
                (group.chain && group.chain.name.toLowerCase().includes(lowerCaseSearch)) || 
                group.children.length > 0
            ); 

        if (searchTerm) {
            const newExpandedGroups: Record<string, boolean> = {};
            filteredGroups.forEach(g => {
                newExpandedGroups[g.chain.name] = true;
            });
            setExpandedGroups(newExpandedGroups);
        } else {
            setExpandedGroups({});
        }

        const filteredIndependents = finalIndependents
            .filter(c => c.name.toLowerCase().includes(lowerCaseSearch))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        filteredGroups.sort((a, b) => a.chain.name.localeCompare(b.chain.name));

        return { independents: filteredIndependents, groups: filteredGroups };

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
        // Immediately collapse all groups after adding chains for a clean UI
        setExpandedGroups({});
    };
    
    return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Blockchains</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                    type="text"
                    placeholder="Search blockchains..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-2">
                    {displayableChains.groups.map(({ chain, children }) => {
                        return (
                            <div key={`parent-${chain.id}`}>
                                <div className="flex items-center justify-between">
                                    <ChainItem
                                        chain={chain}
                                        isSelected={selectedChains.includes(chain.name)}
                                        isDisabled={false} // Only eligible chains are in displayableChains
                                        onToggle={handleToggleSelection}
                                    />
                                    {children.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                setExpandedGroups(prev => ({ ...prev, [chain.name]: !prev[chain.name] }));
                                            }}
                                            className="p-2 ml-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
                                            aria-label={expandedGroups[chain.name] ? `Collapse ${chain.name} L2s` : `Expand ${chain.name} L2s`}
                                        >
                                            <svg className={`w-5 h-5 transform transition-transform ${expandedGroups[chain.name] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    )}
                                </div>
                                {expandedGroups[chain.name] && children.length > 0 && (
                                    <div className="pl-8 pt-2 space-y-1">
                                        {children.map((child, index) => (
                                            <ChainItem 
                                                key={`child-${child.name}-${index}`} 
                                                chain={child} 
                                                isSelected={selectedChains.includes(child.name)} 
                                                isDisabled={false} // Only eligible chains are in displayableChains
                                                onToggle={handleToggleSelection} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {displayableChains.independents.map((chain, index) => (
                         <ChainItem 
                            key={`independent-${chain.name}-${index}`} 
                            chain={chain} 
                            isSelected={selectedChains.includes(chain.name)} 
                            isDisabled={false} // Only eligible chains are in displayableChains
                            onToggle={handleToggleSelection} 
                        />
                    ))}
                    {displayableChains.independents.length === 0 && displayableChains.groups.length === 0 && searchTerm.length > 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400">No matching blockchains found.</div>
                    )}
                    {displayableChains.independents.length === 0 && displayableChains.groups.length === 0 && searchTerm.length === 0 && (
                        // This message only appears if there are no eligible chains to add at all
                        <div className="text-center text-gray-500 dark:text-gray-400">All supported blockchains are already configured.</div>
                    )}
                </div>

                {selectedChains.length > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedChains.length} chain(s) selected</span>
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
