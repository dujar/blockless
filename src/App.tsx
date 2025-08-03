import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppBar from './AppBar';
import { ThemeProvider } from './context/ThemeProvider';

const AlphaBanner = () => (
  <div className="bg-neutral-700 text-neutral-300 text-center p-2 text-sm font-mono flex items-center justify-center">
    <span className="mr-2">💻</span> This application is currently in Alpha mode. Expect bugs and rapid changes.
  </div>
);
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import CreateOrderPage from './pages/CreateOrderPage';
import CrossSwapPage from './pages/CrossSwapPage';
import SplashScreen from './SplashScreen';
import ConnectWalletPage from './pages/ConnectWalletPage';
import BlockchainThemesPage from './pages/BlockchainThemesPage';
import OrderSwapPage from './features/order-swap/page';
import QRCodePage from './pages/QRCodePage'; // Import the new OrderSwapPage

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

  // Determine if in development mode for conditional routing
  const isDevMode = import.meta.env.DEV;

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <AppBar />
        <AlphaBanner />
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/create-order" element={<CreateOrderPage />} />
              <Route path="/connect-wallet" element={<ConnectWalletPage />} />
              <Route path="/order" element={<OrderSwapPage />} /> {/* New route for Order Swap */}
              <Route path="/qr-codes" element={<QRCodePage />} />

              {/* Development-only routes */}
              {isDevMode && (
                <>
                  <Route path="/swap" element={<CrossSwapPage />} />
                  <Route path="/blockchain-themes" element={<BlockchainThemesPage />} />
                </>
              )}
            </Routes>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
