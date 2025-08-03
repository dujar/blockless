import React, { useState, useMemo, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const setBlockchainTheme = (blockchainTheme: string) => {
    setTheme(blockchainTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme',theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    setBlockchainTheme,
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
