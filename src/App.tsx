import { useEffect, useState } from 'react'
import SwapLimitCard from './SwapLimitCard'

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Decentralized Swap Interface
          </h1>
        </header>
        
        <main>
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-100 pb-3 mb-6">
              Swap Details
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="space-y-4">
                {swapParams.blockchain && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 w-40">Blockchain:</span>
                    <span className="text-gray-900 mt-1 sm:mt-0">{swapParams.blockchain}</span>
                  </div>
                )}
                {swapParams.amount && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 w-40">Amount:</span>
                    <span className="text-gray-900 mt-1 sm:mt-0">{swapParams.amount}</span>
                  </div>
                )}
                {swapParams.targetAddress && (
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-700 w-40">Target Address:</span>
                    <span className="text-gray-900 mt-1 sm:mt-0 break-all">{swapParams.targetAddress}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <SwapLimitCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App