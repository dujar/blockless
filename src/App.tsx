import { useEffect, useState } from 'react'
import MultiStepSwap from './MultiStepSwap'
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
          
          <div className="flex justify-center">
            <MultiStepSwap swapParams={swapParams} />
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