import { useAccount, useConnect } from 'wagmi'
import { NavLink } from 'react-router-dom'
import blocklessLogo from './assets/blockless.svg'
import { useMerchantConfig } from './hooks/useMerchantConfig'; // Import useMerchantConfig

export default function AppBar() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { config, saveConfig, isLoaded } = useMerchantConfig(); // Get config and save function

  // Use state from merchant config directly, or local state until config is loaded
  // Initialize internal darkMode state from config once loaded.
  // The value of 'darkModeEnabled' from config will be debounced,
  // but for immediate UI feedback, we can use an effect to update the DOM directly.
  // The `config?.themePreferences?.darkModeEnabled` is already derived from the debounced state in useRegistrationForm.
  // So, using `config?.themePreferences?.darkModeEnabled` here is correct.
  const currentDarkMode = config?.themePreferences?.darkModeEnabled ?? window.matchMedia('(prefers-color-scheme: dark)').matches;


  const toggleTheme = () => {
    // Calculate the new dark mode state
    const newDarkMode = !currentDarkMode;
    
    // Update merchant config
    if (isLoaded && config) { // Ensure config is loaded before trying to save
      saveConfig({
        ...config, 
        themePreferences: {
          ...config.themePreferences, // Preserve other theme preferences
          darkModeEnabled: newDarkMode,
        },
      });
    }

    // Directly apply/remove 'dark' class for immediate visual feedback
    // This is also handled by App.tsx's useEffect, but immediate feedback here is good.
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' // Uses primary color for active link
        : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  return (
    <header className="bg-white dark:bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <img src={blocklessLogo} alt="Blockless" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Blockless Swap</h1>
            </NavLink>
            <nav className="hidden md:flex items-baseline space-x-4 ml-10">
              <NavLink to="/register" className={navLinkClasses}>
                Register
              </NavLink>
              <NavLink to="/create-order" className={navLinkClasses}>
                Create Order
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle theme"
            >
              {currentDarkMode ? ( // Use currentDarkMode derived from config
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Settings Button - Added next to theme toggle */}
            <NavLink
              to="/register"
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Settings"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.325-.33-.796-.54-1.306-.54H9.804c-.51 0-.98.21-1.305.54L5.1 6.38a2.983 2.983 0 00-1.071 1.256L2.202 10.7c-.1.341-.1.7-.002 1.03l1.824 3.125c.138.236.37.417.658.58L9.2 18.82c.325.33.796.54 1.306.54h.392c.51 0 .98-.21 1.305-.54l3.013-3.126c.287-.203.52-.384.658-.58l1.824-3.125c.1-.339.1-.699-.002-1.03L16.017 7.63c-.139-.236-.371-.417-.659-.58l-3.012-3.125zm-2.614 6.74L8.2 12.3c-.04.04-.08.08-.12.12-.04.04-.08.08-.12.12-.04.04-.08.08-.12.12-.04.04-.08.08-.12.12a.997.997 0 01-.2.2C7.363 12.87 7.086 12.98 6.8 13c-.286 0-.563-.09-.8-.2a.997.997 0 01-.2-.2c-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12L4.6 9.61c.04-.04.08-.08.12-.12.04-.04.08-.08.12-.12.04-.04.08-.08.12-.12.04-.04.08-.08.12-.12a.997.997 0 01.2-.2c.237-.11.514-.2.8-.2.286 0 .563.09.8.2a.997.997 0 01.2.2c.04.04.08.08.12.12.04.04.08.08.12.12.04.04.08.08.12.12.04.04.08.08.12.12L11.49 9.91zm1.202 0L12.9 7.3c-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12a.997.997 0 01-.2-.2c-.237-.11-.514-.2-.8-.2-.286 0-.563.09-.8.2a.997.997 0 01-.2.2c-.04.04-.08.08-.12.12-.04.04-.08.08-.12-.12-.04-.04-.08-.08-.12-.12L8.2 12.3c-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12a.997.997 0 01-.2-.2c-.237-.11-.514-.2-.8-.2-.286 0-.563.09-.8.2a.997.997 0 01-.2.2c-.04.04-.08.08-.12.12-.04.04-.08.08-.12-.12.04-.04.08-.08.12-.12.04-.04.08-.08.12-.12L7.363 12.87C7.086 12.98 6.8 13 6.514 13c-.286 0-.563-.09-.8-.2a.997.997 0 01-.2-.2c-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12-.04-.04-.08-.08-.12-.12L5.1 6.38a2.983 2.983 0 00-1.071 1.256L2.202 10.7c-.1.341-.1.7-.002 1.03l1.824 3.125c.138.236.37.417.658.58L9.2 18.82c.325.33.796.54 1.306.54h.392c.51 0 .98-.21 1.305-.54l3.013-3.126c.287-.203.52-.384.658-.58l1.824-3.125c.1-.339.1-.699-.002-1.03L16.017 7.63c-.139-.236-.371-.417-.659-.58l-3.012-3.125z" clipRule="evenodd" />
              </svg>
            </NavLink>
            
            {/* Wallet Connection */}
            {isConnected ? (
              <span className="text-sm text-gray-800 dark:text-gray-300">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
