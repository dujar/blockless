import React, { useEffect } from 'react';
import { useChainContext } from '../context/CrossChainContext';
import { BlockchainTokenPaymentOption } from '../components/BlockchainTokenPaymentOption';

export const OrderSelectionStep: React.FC = () => {
  const { chain, setChain, chainResponse,orders } = useChainContext();
  const chains = chainResponse.data;

  

  

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
        <BlockchainTokenPaymentOption key={order.orderHash} order={order} />
      ))}
    </div>
  );
};
