import { NavLink } from 'react-router-dom';
import blocklessLogo from './assets/blockless.svg';
import { ConnectButton } from './components/ConnectButton';
import ThemeSwitcher from './components/ThemeSwitcher';

export default function AppBar() {

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `${isActive ? 'active' : ''}`;

  return (
    <header className="navbar bg-base-200 text-base-content shadow-sm h-16 min-h-0 px-2 sm:px-4 sticky top-0 z-30">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
            <li><NavLink to="/register" className={navLinkClasses}>Register</NavLink></li>
            <li><NavLink to="/create-order" className={navLinkClasses}>Create Order</NavLink></li>
          </ul>
        </div>
        <NavLink to="/" className="btn btn-ghost normal-case text-lg flex items-center px-1 sm:px-2">
          <img src={blocklessLogo} alt="Blockless" className="h-7 w-7 mr-2" />
          <span className="hidden sm:inline">Blockless Swap</span>
        </NavLink>
      </div>
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li><NavLink to="/register" className={({isActive}) => `btn btn-ghost ${isActive ? 'btn-active' : ''}`}>Register</NavLink></li>
          <li><NavLink to="/create-order" className={({isActive}) => `btn btn-ghost ${isActive ? 'btn-active' : ''}`}>Create Order</NavLink></li>
        </ul>
      </div>
      <div className="navbar-end space-x-0 sm:space-x-2">
        <ThemeSwitcher />
        <ConnectButton />
      </div>
    </header>
  );
}
