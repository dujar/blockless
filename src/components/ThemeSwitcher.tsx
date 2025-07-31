import React from 'react';
import { useTheme } from '../context/theme-context';

const ThemeSwitcher: React.FC = () => {
  const { darkModeEnabled, setDarkModeEnabled } = useTheme();

  const toggleTheme = () => {
    setDarkModeEnabled(!darkModeEnabled);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="btn btn-ghost">
      {darkModeEnabled ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeSwitcher;
