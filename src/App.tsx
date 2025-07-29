import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppBar from './AppBar'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import CreateOrderPage from './pages/CreateOrderPage'
import SwapPage from './pages/SwapPage'
import SplashScreen from './SplashScreen'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // Shorter splash screen
    return () => clearTimeout(timer);
  }, [])
  
  if (loading) {
    return <SplashScreen />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppBar />
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create-order" element={<CreateOrderPage />} />
            <Route path="/swap" element={<SwapPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
