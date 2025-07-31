import { NavLink } from 'react-router-dom';
import blocklessLogo from './assets/blockless.svg';
import { ConnectWallet } from './components/ConnectWallet';
import ThemeSwitcher from './components/ThemeSwitcher';

export default function AppBar() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `btn btn-ghost ${
      isActive ? 'btn-active' : ''
    }`;

  return (
    <div className="bg-base-200 text-base-content shadow-sm h-16 min-h-0 px-4 flex justify-between items-center w-full">
      {/* Left section: Logo and Navigation */}
      <div className="flex items-center">
        <NavLink to="/" className="btn btn-ghost normal-case text-lg flex items-center mr-4">
          <img src={blocklessLogo} alt="Blockless" className="h-7 w-7 mr-2" />
          Blockless Swap
        </NavLink>
        <ul className="menu menu-horizontal p-0 flex items-center">
          <li><NavLink to="/register" className={navLinkClasses}>Register</NavLink></li>
          <li><NavLink to="/create-order" className={navLinkClasses}>Create Order</NavLink></li>
        </ul>
      </div>

      {/* Right section: Theme Switcher and Connect Wallet */}
      <div className="flex space-x-2">
        <ThemeSwitcher />
        <ConnectWallet onConnect={() => {}} />
      </div>
    </div>
  );
}

