import React, { useCallback, useEffect } from 'react';
import { useChainContext } from '../context/CrossChainContext';
import type { BlockchainData } from '../../../data/blockchains';
import { BlockchainTokenSelection } from '../components/BlockchainTokenSelection';

export const OrderSelectionStep: React.FC = () => {
  const { chain, setChain, chainResponse,orders } = useChainContext();
  let chains = chainResponse.data;

  const isValidChain = (chain: BlockchainData) => {
    return chains?.some(c => c.id == chain.id);
  };

  const handleChainSelect = useCallback((chainData: BlockchainData) => {
    if (isValidChain(chainData) && chainData.chainId !== undefined) {
      setChain(chainData);
    }
  }, [setChain, chains]);

  useEffect(() => {
    // If no chain is selected, set the first supported chain
    if (!chain && chains&& chains.length > 0) {
      setChain(chains[0]);
    }
  }, [chain, chains, setChain]);

  if (!chains) {
    return <div>Loading chains...</div>;
  }
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <BlockchainTokenSelection key={order.dstAddress + order.token + order.amount} order={order} />
      ))}
    </div>
  );
};
