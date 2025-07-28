import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { blockchainData } from '../../../data/blockchains';
import type { UseSwapFormReturn } from '../hooks/useSwapForm';

interface CreateSwapOrderFormProps {
    form: UseSwapFormReturn;
    onGenerateQR: () => void;
}

const CreateSwapOrderForm = ({ form, onGenerateQR }: CreateSwapOrderFormProps) => {
    const { 
        formData, 
        handleInputChange, 
        handleReset, 
        isAddressValid, 
        isFormValid,
    } = form;
    
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const handleConnectWallet = () => {
        connect({ connector: connectors[0] });
    };
    
    const availableChains = blockchainData.map(chain => ({
        id: chain.networkId,
        name: chain.name
    }));

    return (
        <div className="lg:order-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Swap Order
            </h2>
            
            <div className="space-y-6">
                {/* Blockchain Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Blockchain
                    </label>
                    <div className="flex space-x-2">
                        <select
                            name="blockchain"
                            value={formData.blockchain}
                            onChange={handleInputChange}
                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Select Blockchain</option>
                            {availableChains.map(chain => (
                                <option key={chain.id} value={chain.name}>
                                    {chain.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Token Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Token Symbol
                    </label>
                    <input
                        type="text"
                        name="token"
                        value={formData.token}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g. ETH, USDC, BTC"
                    />
                </div>
                
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.0"
                        step="any"
                    />
                </div>
                
                {/* Recipient Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Address
                    </label>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            name="targetAddress"
                            value={formData.targetAddress}
                            onChange={handleInputChange}
                            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0x..."
                        />
                        {isAddressValid === true && (
                            <span className="absolute right-3 text-green-500">✓</span>
                        )}
                        {isAddressValid === false && formData.targetAddress.length > 0 && (
                            <span className="absolute right-3 text-red-500">✗</span>
                        )}
                    </div>
                </div>
                
                {/* Wallet Connection */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Wallet Connection
                        </span>
                        {isConnected ? (
                            <button
                                onClick={() => disconnect()}
                                className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectWallet}
                                className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                    
                    {isConnected ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-sm text-green-800 dark:text-green-200">
                                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)} on {chain?.name}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Not connected
                                </span>
                            </div>
                        </div>
                    )}
                    {!isConnected && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                You can connect your wallet to auto-fill your recipient address.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onGenerateQR}
                        disabled={!isFormValid()}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                        !isFormValid()
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateSwapOrderForm;
