import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppBar from './AppBar'
import { useMerchantConfig } from './hooks/useMerchantConfig'; // Import useMerchantConfig

const AlphaBanner = () => (
  <div className="bg-gray-700 text-gray-300 text-center p-2 text-sm font-mono flex items-center justify-center">
    <span className="mr-2">💻</span> This application is currently in Alpha mode. Expect bugs and rapid changes.
  </div>
);
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import CreateOrderPage from './pages/CreateOrderPage'
import SwapPage from './pages/SwapPage'
import SplashScreen from './SplashScreen'

function App() {
  const [loading, setLoading] = useState(true)
  const { config, isLoaded } = useMerchantConfig(); // Get config from hook

  useEffect(() => {
    // Apply initial splash screen timer
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer);
  }, [])
  
  useEffect(() => {
    if (isLoaded) {
      // Determine initial dark mode preference from config or system preference
      const storedDarkMode = config?.themePreferences?.darkModeEnabled;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialDarkMode = storedDarkMode !== undefined ? storedDarkMode : systemPrefersDark;

      // 1. Correctly toggle 'dark' class
      if (initialDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // 2. Apply primary color class
      // Remove any existing theme- prefix class to ensure only one is active
      Array.from(document.documentElement.classList)
        .filter(cls => cls.startsWith('theme-'))
        .forEach(cls => document.documentElement.classList.remove(cls));
      const newPrimaryColorClass = `theme-${config?.themePreferences?.primaryColor || 'blue'}`; // Default to 'blue'
      document.documentElement.classList.add(newPrimaryColorClass);

      // 3. Apply shadow level class
      // Remove any existing shadow-*-applied class
      Array.from(document.documentElement.classList)
        .filter(cls => cls.endsWith('-applied'))
        .forEach(cls => document.documentElement.classList.remove(cls));
      const newShadowLevelClass = `shadow-${config?.themePreferences?.shadowLevel || 'md'}-applied`; // Default to 'md'
      document.documentElement.classList.add(newShadowLevelClass);

    }
  }, [config, isLoaded]); // Re-run when config (themePreferences) changes


  if (loading) {
    return <SplashScreen />;
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <AppBar />
      <AlphaBanner />
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
