import { useEffect, useState } from 'react'
import SwapLimitCard from './SwapLimitCard'
import AppBar from './AppBar'

interface SwapParams {
  blockchain?: string
  amount?: string
  targetAddress?: string
}

function App() {
  const [swapParams, setSwapParams] = useState<SwapParams>({})
  
  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const params: SwapParams = {
      blockchain: urlParams.get('blockchain') || undefined,
      amount: urlParams.get('amount') || undefined,
      targetAddress: urlParams.get('targetAddress') || undefined
    }
    setSwapParams(params)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppBar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Decentralized Token Swaps
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Securely swap tokens across multiple blockchain networks with our decentralized exchange
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Swap Details
              </h2>
              
              <div className="space-y-6">
                {swapParams.blockchain && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Blockchain:</span>
                    <span className="text-gray-900 dark:text-white mt-1 sm:mt-0">{swapParams.blockchain}</span>
                  </div>
                )}
                {swapParams.amount && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Amount:</span>
                    <span className="text-gray-900 dark:text-white mt-1 sm:mt-0">{swapParams.amount}</span>
                  </div>
                )}
                {swapParams.targetAddress && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Target Address:</span>
                    <span className="text-gray-900 dark:text-white mt-1 sm:mt-0 break-all">{swapParams.targetAddress}</span>
                  </div>
                )}
                
                {!swapParams.blockchain && !swapParams.amount && !swapParams.targetAddress && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No swap parameters provided. Connect your wallet to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <SwapLimitCard />
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Supported Networks
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                <span className="font-medium text-gray-900 dark:text-white">Ethereum</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                <span className="font-medium text-gray-900 dark:text-white">BNB Chain</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                <span className="font-medium text-gray-900 dark:text-white">Polygon</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                <span className="font-medium text-gray-900 dark:text-white">Arbitrum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App