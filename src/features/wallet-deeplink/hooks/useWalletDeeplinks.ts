import { useMemo } from 'react';
import { blockchainData } from '../../../data/blockchains';
import { tokenData } from '../../../data/tokens';
import { wallets, type Wallet } from '../../../data/wallets';

interface UseWalletDeeplinksProps {
  blockchainName: string;
  tokenSymbol: string;
  amount: string;
  recipientAddress: string;
}

export const useWalletDeeplinks = ({
  blockchainName,
  tokenSymbol,
  amount,
  recipientAddress,
}: UseWalletDeeplinksProps) => {
  const chain = useMemo(
    () => blockchainData.find((c) => c.name === blockchainName),
    [blockchainName]
  );

  const token = useMemo(
    () =>
      chain
        ? tokenData.find(
            (t) =>
              t.symbol.toLowerCase() === tokenSymbol.toLowerCase() &&
              t.chainId === chain.chainId
          )
        : undefined,
    [chain, tokenSymbol]
  );

  const applicableWallets = useMemo(() => {
    if (!chain || !token) return [];

    return wallets
      .filter((wallet) => wallet.supports(chain))
      .map((wallet) => ({
        ...wallet,
        deeplink: wallet.generateDeeplink({
          chain,
          token,
          amount,
          recipientAddress,
        }),
      }))
      .filter((wallet): wallet is Wallet & { deeplink: string } => !!wallet.deeplink);
  }, [chain, token, amount, recipientAddress]);

  return { chain, token, applicableWallets };
};
