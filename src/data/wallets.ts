import metaMaskLogo from '../assets/metamask.svg';
import trustWalletLogo from '../assets/trust.svg';
import phantomLogo from '../assets/phantom.svg';
import coinbaseWalletLogo from '../assets/coinbase.svg';
import rabbyWalletLogo from '../assets/rabby.svg';
import exodusLogo from '../assets/exodus.svg';
import zengoLogo from '../assets/zengo.svg';
import { blockchainData } from './blockchains';
import type { TokenInfo } from './tokens';
import { parseUnits } from 'viem';

export interface DeeplinkParams {
  chain: typeof blockchainData[0];
  token: TokenInfo;
  amount: string;
  recipientAddress: string;
}

export interface Wallet { // Added for re-evaluation
  name: string;
  logo: string;
  supports: (chain: typeof blockchainData[0]) => boolean;
  generateDeeplink: (params: DeeplinkParams) => string | null;
}

export const wallets: Wallet[] = [
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
