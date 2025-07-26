import { useEffect, useState } from 'react'
import './App.css'

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
    <div className="swap-app">
      <header>
        <h1>Decentralized Swap Interface</h1>
      </header>
      
      <main>
        <div className="swap-container">
          <h2>Swap Details</h2>
          <div className="swap-details">
            {swapParams.blockchain && (
              <p><strong>Blockchain:</strong> {swapParams.blockchain}</p>
            )}
            {swapParams.amount && (
              <p><strong>Amount:</strong> {swapParams.amount}</p>
            )}
            {swapParams.targetAddress && (
              <p><strong>Target Address:</strong> {swapParams.targetAddress}</p>
            )}
          </div>
          
          <div className="swap-interface">
            <iframe 
              src={`https://swap.interface.example.com?blockchain=${swapParams.blockchain || ''}&amount=${swapParams.amount || ''}&targetAddress=${swapParams.targetAddress || ''}`}
              width="100%"
              height="600px"
              title="Swap Interface"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App