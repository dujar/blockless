import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { config } from './wagmi.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ThemeProvider } from './context/theme-context.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
