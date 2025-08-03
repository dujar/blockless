import { ChainProvider } from '../features/cross-swap-order/components/ChainProvider';
import { OrderSelectionStep } from '../features/cross-swap-order/sections/OrderSelectionStep';

export default function CrossSwapPage() {
  return (
    <ChainProvider>
      <SwapFlow />
    </ChainProvider>
  );
}

function SwapFlow() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-base-100 rounded-lg shadow p-6 mb-6">
        <h1 className="text-xl font-bold mb-4">Cross-Chain Swap</h1>
        <OrderSelectionStep />
      </div>
    </div>
  );
}
