import { createContext } from 'react';

export interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  blockchainTheme: string;
  setBlockchainTheme: (theme:string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
