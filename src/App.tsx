import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppBar from './AppBar';

const AlphaBanner = () => (
  <div className="bg-gray-700 text-gray-300 text-center p-2 text-sm font-mono flex items-center justify-center">
    <span className="mr-2">💻</span> This application is currently in Alpha mode. Expect bugs and rapid changes.
  </div>
);
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import CreateOrderPage from './pages/CreateOrderPage';
import SwapPage from './pages/SwapPage';
import SplashScreen from './SplashScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen">
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
  );
}

export default App;

