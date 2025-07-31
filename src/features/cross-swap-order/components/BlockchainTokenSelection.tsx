import type { ChainContextType } from "../context/CrossChainContext";



export const BlockchainTokenSelection: React.FC<{order: ChainContextType["orders"][number]}> = ({order}) => {

const chain = order.chain;
  return (
    <div 
    key={order.dstAddress + order.token + order.amount}
    className="space-y-4">
        <button
          className={`
            w-full p-4 rounded-lg border 
            ${chain?.id === order.chain.id 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-blue-200'}
            dark:border-gray-700 dark:${order.chain.theme?.bg || 'bg-gray-800'}
          `}
        >
          <div className="flex items-center justify-between">
            <span>{order.token}</span>
            <span>{order.amount}</span>
          </div>
        </button>
    </div>
  );
}