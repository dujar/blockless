import { wallets } from '../data/wallets';
import './WalletMarquee.css';

const WalletMarquee = () => {
  const allWallets = [...wallets, ...wallets]; // Duplicate for seamless loop

  return (
    <div className="marquee-container">
      <div className="marquee">
        {allWallets.map((wallet, index) => (
          <div key={index} className="marquee-item">
            <img src={wallet.logo} alt={wallet.name} className="h-12 w-12 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletMarquee;
