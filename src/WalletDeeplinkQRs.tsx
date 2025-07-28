import { QRCode } from 'react-qrcode-logo';
import { blockchainData } from './data/blockchains';
import { tokenData } from './data/tokens';
import type { TokenInfo } from './data/tokens';
import { parseUnits } from 'viem';

// NOTE: Please add the actual SVG logo files to `src/assets/wallets/`
import metaMaskLogo from './assets/blockless.svg'; // Placeholder
import trustWalletLogo from './assets/blockless.svg'; // Placeholder
import phantomLogo from './assets/blockless.svg'; // Placeholder
import coinbaseWalletLogo from './assets/blockless.svg'; // Placeholder
import rabbyWalletLogo from './assets/blockless.svg'; // Placeholder
import exodusLogo from './assets/blockless.svg'; // Placeholder
import zengoLogo from './assets/blockless.svg'; // Placeholder


interface WalletDeeplinkQRsProps {
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
}

interface DeeplinkParams {
  chain: typeof blockchainData[0];
  token: TokenInfo;
  amount: string;
  recipientAddress: string;
}

interface Wallet {
  name: string;
  logo: string;
  supports: (chain: typeof blockchainData[0]) => boolean;
  generateDeeplink: (params: DeeplinkParams) => string | null;
}

const wallets: Wallet[] = [
  {
    name: 'MetaMask',
    logo: metaMaskLogo,
    supports: (chain) => chain.isEVM,
    generateDeeplink: ({ chain, token, amount, recipientAddress }) => {
      if (!chain.isEVM || !chain.chainId) return null;
      if (token.address === 'native') {
        const value = parseUnits(amount, token.decimals).toString();
        return `https://metamask.app.link/send/${recipientAddress}@${chain.chainId}?value=${value}`;
      }
      const value = parseUnits(amount, token.decimals).toString();
      return `https://metamask.app.link/send/${token.address}/transfer?address=${recipientAddress}&uint256=${value}`;
    },
  },
  {
    name: 'Trust Wallet',
    logo: trustWalletLogo,
    supports: () => true, // Supports many chains
    generateDeeplink: ({ chain, token, amount, recipientAddress }) => {
      if (!chain.isEVM || !chain.chainId) return null;
      if (token.address === 'native') {
        return `https://link.trustwallet.com/send?coin=${chain.chainId}&address=${recipientAddress}&amount=${amount}`;
      }
      return `https://link.trustwallet.com/transfer?asset=c${chain.chainId}_t${token.address}&to=${recipientAddress}&amount=${amount}`;
    },
  },
  {
    name: 'Coinbase Wallet',
    logo: coinbaseWalletLogo,
    supports: () => true,
    generateDeeplink: ({ chain, token, amount, recipientAddress }) => {
      if (!chain.isEVM || !chain.chainId) return null;
      if (token.address === 'native') {
        return `https://go.cb-w.com/send?to=${recipientAddress}&value=${amount}&chainId=${chain.chainId}`;
      }
      const value = parseUnits(amount, token.decimals).toString();
      return `https://go.cb-w.com/send?to=${token.address}&function=transfer&params.to=${recipientAddress}&params.value=${value}&chainId=${chain.chainId}`;
    },
  },
  {
    name: 'Rabby Wallet',
    logo: rabbyWalletLogo,
    supports: (chain) => chain.isEVM,
    generateDeeplink: ({ chain, token, amount, recipientAddress }) => {
      if (!chain.isEVM || !chain.chainId) return null;
      const url = new URL('https://rabby.io/send');
      url.searchParams.set('address', recipientAddress);
      url.searchParams.set('chainId', String(chain.chainId));
      url.searchParams.set('amount', amount);
      if (token.address !== 'native') {
        url.searchParams.set('tokenAddress', token.address);
      }
      return url.toString();
    },
  },
  {
    name: 'Zengo',
    logo: zengoLogo,
    supports: (chain) => chain.isEVM,
    generateDeeplink: ({ chain, token, amount, recipientAddress }) => {
        if (!chain.isEVM || !chain.chainId) return null;
        const url = new URL('https://get.zengo.com/send');
        url.searchParams.set('address', recipientAddress);
        url.searchParams.set('chainId', String(chain.chainId));
        url.searchParams.set('value', amount);
        if (token.address !== 'native') {
            url.searchParams.set('tokenAddress', token.address);
        }
        return url.toString();
    }
  },
  {
    name: 'Exodus',
    logo: exodusLogo,
    supports: () => true,
    generateDeeplink: ({ chain, amount, recipientAddress }) => {
        const coinNameMap: Record<string, string> = {
            ethereum: 'ethereum',
            polygon: 'polygon',
            bnb: 'binance-smart-chain',
            avalanche: 'avalanche',
        };
        const coin = coinNameMap[chain.id];
        if (!coin) return null;

        const url = new URL('https://www.exodus.com/send');
        url.searchParams.set('coin', coin);
        url.searchParams.set('addr', recipientAddress);
        url.searchParams.set('amount', amount);
        return url.toString();
    }
  },
  {
    name: 'Phantom',
    logo: phantomLogo,
    supports: () => true,
    generateDeeplink: ({ chain, token, amount, recipientAddress }) => {
      if (!chain.isEVM) return null;
      const value = parseUnits(amount, token.decimals).toString();
      return `https://phantom.app/ul/v1/send?to=${recipientAddress}&amount=${value}&asset=${token.address}&chain=eip155:${chain.chainId}`;
    }
  }
];

export const WalletDeeplinkQRs = ({ blockchainName, tokenSymbol, amount, recipientAddress }: WalletDeeplinkQRsProps) => {
  const chain = blockchainData.find((c) => c.name === blockchainName);
  if (!chain) return <div className="text-red-500 dark:text-red-400 p-4 text-center">Unsupported blockchain selected.</div>;

  const token = tokenData.find((t) => t.symbol.toLowerCase() === tokenSymbol.toLowerCase() && t.chainId === chain.chainId);
  if (!token) return <div className="text-red-500 dark:text-red-400 p-4 text-center">Unsupported token for this blockchain.</div>;

  const applicableWallets = wallets.filter((wallet) => wallet.supports(chain));

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {applicableWallets.map((wallet) => {
          const deeplink = wallet.generateDeeplink({ chain, token, amount, recipientAddress });
          if (!deeplink) return null;
          
          return (
            <div key={wallet.name} className="flex flex-col items-center text-center">
              <div className="p-2 bg-white rounded-lg border border-gray-200 dark:border-gray-600">
                <QRCode value={deeplink} size={128} logoImage={wallet.logo} logoWidth={32} logoHeight={32} />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">{wallet.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletDeeplinkQRs;
