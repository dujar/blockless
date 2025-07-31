import React from 'react';
import { useTheme } from '../context/useTheme';

interface BlockchainCardProps {
  theme: string;
  title: string;
  children: React.ReactNode;
}

export const BlockchainCard: React.FC<BlockchainCardProps> = ({ theme, title, children }) => {
  const { setBlockchainTheme } = useTheme();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {children}
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={() => setBlockchainTheme(theme)}>Set Theme</button>
        </div>
      </div>
    </div>
  );
};
