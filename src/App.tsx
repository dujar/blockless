import { useEffect, useState } from 'react'
import MultiStepSwap from './MultiStepSwap'
import LandingPage from './LandingPage'
import AppBar from './AppBar'
import blocklessLogo from './assets/blockless.svg'

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
    let params: SwapParams = {}
    
    // Check for new cross-chain swap parameters (src, dst, target)
    const src = urlParams.get('src')
    const dst = urlParams.get('dst')
    const target = urlParams.get('target')
    
    if (src || dst || target) {
      // Parse src parameter (format: chainId:token)
      if (src) {
        const [chainId, token] = src.split(':')
        // Map chainId to chain name (simplified for demo)
        const chainMap: Record<string, string> = {
          '1': 'Ethereum',
          '56': 'BNB Chain',
          '137': 'Polygon',
          '42161': 'Arbitrum'
        }
        params.blockchain = chainMap[chainId] || `Chain ${chainId}`
        // For amount, we would need to extract from token if it's in format like UNI-100
        // For now, we'll just pass the token name/address
      }
      
      // Use target as targetAddress
      if (target) {
        params.targetAddress = target
      }
      
      // For amount, we would parse from src or dst if they contain amount info
      // For simplicity, we're not parsing amount from the new format in this example
    } else {
      // Fallback to old parameter format
      params = {
        blockchain: urlParams.get('blockchain') || undefined,
        amount: urlParams.get('amount') || undefined,
        targetAddress: urlParams.get('targetAddress') || undefined
      }
    }
    
    setSwapParams(params)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppBar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Show LandingPage if no parameters, otherwise show MultiStepSwap */}
          {!swapParams.blockchain && !swapParams.amount && !swapParams.targetAddress ? (
            <LandingPage />
          ) : (
            <div className="max-w-4xl mx-auto">
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
          )}
        </div>
      </div>
    </div>
  )
}

export default App