import { useEffect, useState } from 'react'
import MultiStepSwap from './MultiStepSwap'
import LandingPage from './LandingPage'
import AppBar from './AppBar'
import blockchainData from './data/blockchains.json'
import { parseSwapParamsSafe } from './SwapParamSafe'
import type { SwapParams } from './SwapParamSafe'

function App() {
  const [swapParams, setSwapParams] = useState<SwapParams | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    if (urlParams.toString() === '') {
      setSwapParams(null)
      return
    }

    const result = parseSwapParamsSafe(urlParams)

    if (result.success && result.data) {
      setError(null)
      setSwapParams(result.data)
      
      const currentPath = window.location.pathname
      if (!currentPath.includes('/swap')) {
        const newUrl = '/swap' + window.location.search
        window.history.replaceState({}, '', newUrl)
      }
    } else {
      setError(result.error || 'Invalid swap parameters')
      setSwapParams(null)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppBar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Show error message if there's an error */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Invalid URL Parameters</h3>
                </div>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                  <p className="mt-2">Please use the form below to create a valid swap request.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Show LandingPage if no parameters, if there's an error, or if not on /swap path with valid params, otherwise show MultiStepSwap */}
          {!swapParams || error ? (
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
                  {blockchainData.map((chain) => (
                    <div key={chain.id} className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{chain.name}</span>
                    </div>
                  ))}
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