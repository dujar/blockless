import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
  darkModeEnabled: boolean;
  setDarkModeEnabled: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  darkModeEnabled: false,
  setDarkModeEnabled: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkModeEnabled, setDarkModeEnabled] = useState(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkModeEnabled]);

  return (
    <ThemeContext.Provider value={{ darkModeEnabled, setDarkModeEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
};