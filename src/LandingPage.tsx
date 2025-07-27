import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { QRCode } from 'react-qrcode-logo';
import blocklessLogo from './assets/blockless.svg';
import blockchainData from './data/blockchains.json';

const LandingPage = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [formData, setFormData] = useState({
    blockchain: '',
    token: '',
    amount: '',
    targetAddress: ''
  });
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [isFullScreenQR, setIsFullScreenQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQRCodeURL()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Available chains from blockchain data
  const availableChains = blockchainData.map(chain => ({
    id: chain.id,
    name: chain.name
  }));
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleConnectWallet = () => {
    connect({ connector: connectors[0] });
  };
  
  const handleAutoFill = () => {
    if (isConnected && address && chain) {
      setFormData(prev => ({
        ...prev,
        blockchain: chain.name,
        token: 'ETH', // Default token for auto-fill
        targetAddress: address
      }));
    }
  };
  
  const isFormValid = () => {
    return (
      formData.blockchain && formData.blockchain.trim() !== '' &&
      formData.token && formData.token.trim() !== '' &&
      formData.amount && formData.amount.trim() !== '' &&
      parseFloat(formData.amount) > 0 &&
      formData.targetAddress && formData.targetAddress.trim() !== ''
    );
  };
  
  const generateQRCodeURL = () => {
    const params = new URLSearchParams();
    if (formData.blockchain) params.append('blockchain', formData.blockchain);
    if (formData.token) params.append('token', formData.token);
    if (formData.amount) params.append('amount', formData.amount);
    if (formData.targetAddress) params.append('targetAddress', formData.targetAddress);
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };
  
  const handleGenerateQR = () => {
    setShowQRCode(true);
  };
  
  const handleReset = () => {
    setFormData({
      blockchain: '',
      token: '',
      amount: '',
      targetAddress: ''
    });
    setShowQRCode(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Blockless Swap
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Secure cross-chain swaps powered by 1inch Fusion+
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
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
                {isConnected && chain && (
                  <button
                    onClick={handleAutoFill}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition text-sm"
                  >
                    Auto-fill
                  </button>
                )}
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
              />
            </div>
            
            {/* Target Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="targetAddress"
                  value={formData.targetAddress}
                  onChange={handleInputChange}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0x..."
                />
                {isConnected && address && (
                  <button
                    onClick={handleAutoFill}
                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition text-sm"
                  >
                    Auto-fill
                  </button>
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
                onClick={handleGenerateQR}
                disabled={!isFormValid()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                  !isFormValid()
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
        
        {/* QR Code Section */}
        <div className="lg:order-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {showQRCode ? 'Your Swap Details' : 'How It Works'}
          </h2>
          
          {showQRCode ? (
            <div className={`flex flex-col ${isFullScreenQR ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : 'items-center'}`}>
              <div className={`${isFullScreenQR ? 'w-full h-full flex flex-col' : 'mb-6 p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg w-full max-w-md'}`}>
                <div className={`flex ${isFullScreenQR ? 'h-full flex-col items-center justify-center p-4' : 'justify-center mb-4'}`}>
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="border-4 border-blue-500 rounded-lg p-2 cursor-pointer"
                      onClick={() => setIsFullScreenQR(!isFullScreenQR)}
                    >
                      <QRCode 
                        value={generateQRCodeURL()} 
                        size={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) : 192}
                        quietZone={10}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        logoImage={blocklessLogo}
                        logoWidth={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 48}
                        logoHeight={isFullScreenQR ? Math.min(window.innerWidth * 0.8, window.innerHeight * 0.5) * 0.25 : 48}
                        logoOpacity={1}
                        removeQrCodeBehindLogo={true}
                        logoPadding={2}
                        logoPaddingStyle="circle"
                        qrStyle="squares"
                      />
                    </div>
                  </div>
                </div>
                
                {!isFullScreenQR && (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Swap Details</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Scan with your mobile wallet to execute this swap
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blockchain</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.blockchain}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Token</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.token}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formData.amount}</span>
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Address</div>
                        <div className="text-xs font-mono break-all text-gray-900 dark:text-white">
                          {formData.targetAddress}
                        </div>
                      </div>
                      
                      <div 
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                        onClick={copyToClipboard}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Shareable Link</div>
                          <div className="flex items-center">
                            {copied ? (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Copied!
                              </span>
                            ) : (
                              <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                </svg>
                                Copy
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-mono break-all text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          {generateQRCodeURL()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className={`flex ${isFullScreenQR ? 'fixed bottom-4 left-0 right-0 justify-center' : 'mt-4 justify-center'}`}>
                <button
                  onClick={() => isFullScreenQR ? setIsFullScreenQR(false) : setShowQRCode(false)}
                  className="px-4 py-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  {isFullScreenQR ? 'Exit Full Screen' : '← Back to Form'}
                </button>
                {!isFullScreenQR && (
                  <button
                    onClick={() => setIsFullScreenQR(true)}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Full Screen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <span className="text-blue-500 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Fill Swap Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter the blockchain, amount, and target address for your swap
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <span className="text-blue-500 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Generate Swap Details
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a shareable link with your swap details
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <span className="text-blue-500 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Share & Execute
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share the link with others who can access your pre-filled order
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Tip: Auto-fill from Wallet
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Connect your wallet to automatically fill in your address and current blockchain.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Supported Networks */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Supported Networks
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {availableChains.map(chain => (
            <div key={chain.id} className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
              <span className="font-medium text-gray-900 dark:text-white">{chain.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;