import blocklessLogo from './assets/blockless.svg';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <img src={blocklessLogo} alt="Blockless Logo" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;