import { Link } from 'react-router-dom';
import WalletMarquee from '../components/WalletMarquee';
import OneInchLogo from '../assets/1inch.svg';

const LandingPage = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
        Accept Crypto Payments,
        <br />
        <span className="text-primary-500">Simply and Securely.</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-700 dark:text-primary-300">
        Blockless Swap is your gateway to accepting cryptocurrency payments from anyone, anywhere, on any chain.
        Turn your wallet into a universal payment processor.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/register"
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition shadow-dynamic hover:shadow-lg"
        >
          Get Started for Free
        </Link>
        <Link
          to="/create-order"
          className="bg-gray-200 hover:bg-gray-300 dark:bg-primary-800 dark:hover:bg-primary-700 text-gray-800 dark:text-primary-200 px-8 py-3 rounded-lg font-medium text-lg transition"
        >
          Create an Order
        </Link>
      </div>

      <div className="mt-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">How It Works in 3 Simple Steps</h2>
        <div className="grid md:grid-cols-3 gap-10 text-left">
          {/* Step 1 */}
          <div className="bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
              <span className="text-primary-500 text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Register Your Profile</h3>
            <p className="text-gray-700 dark:text-primary-400">
              Set up your merchant profile by specifying your preferred fiat currency, blockchains, and tokens you wish to accept. Your configuration is saved locally in your browser.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
              <span className="text-primary-500 text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Create an Order</h3>
            <p className="text-gray-700 dark:text-primary-400">
              Enter a price in your chosen fiat currency. We instantly generate payment links and QR codes for all your supported cryptos, including a universal cross-chain swap option.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-lg shadow-dynamic relative flex flex-col justify-between">
            <div>
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
                <span className="text-primary-500 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Get Paid</h3>
              <p className="text-gray-700 dark:text-primary-400">
                Your customers scan the QR code that matches their wallet and funds. They can pay directly or use our 1inch-powered swap page to pay from any supported asset.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-end text-gray-600 dark:text-primary-400 text-sm">
              <span className="mr-2">Powered by</span>
              <img src={OneInchLogo} alt="1inch Logo" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Compatible with Wallets Your Customers Love
        </h3>
        <WalletMarquee />
        <p className="mt-8 text-gray-500 dark:text-primary-400">
          And many more coming soon... including direct Web2 payment integrations!
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
