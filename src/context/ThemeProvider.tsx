import React, { useState, useMemo, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [blockchainTheme, setBlockchainTheme] = useState(localStorage.getItem('blockchainTheme') || 'ethereum');

  useEffect(() => {
    const combinedTheme = `${blockchainTheme}-${theme}`;
    document.documentElement.setAttribute('data-theme', combinedTheme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('blockchainTheme', blockchainTheme);
  }, [theme, blockchainTheme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    blockchainTheme,
    setBlockchainTheme,
  }), [theme, blockchainTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
