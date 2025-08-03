
import { useAccount, useDisconnect } from 'wagmi';
import { NavLink } from 'react-router-dom';

export const ConnectButton = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost rounded-btn">
          <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          <span className="sm:hidden text-xs">Account</span>
        </label>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <button onClick={() => disconnect()}>
              Disconnect
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <NavLink to="/connect-wallet" className="btn btn-primary btn-sm sm:btn-md">
      Connect
    </NavLink>
  );
};
