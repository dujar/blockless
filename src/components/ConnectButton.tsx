
import { useAccount, useDisconnect } from 'wagmi';
import { NavLink } from 'react-router-dom';

export const ConnectButton = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center">
        <div className="mr-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {address}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="btn btn-ghost"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <NavLink to="/connect-wallet" className="btn btn-ghost">
      Connect Wallet
    </NavLink>
  );
};
