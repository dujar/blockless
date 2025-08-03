import { blockchainData } from '../data/blockchains';

const SupportedNetworks = () => {
  const availableChains = blockchainData.map(chain => ({
    id: chain.networkId,
    name: chain.name
  }));

  return (
    <div className="mt-16 text-center">
      <h3 className="text-2xl font-bold text-base-content mb-6">
        Supported Networks
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        {availableChains.map(chain => (
          <div key={chain.id} className="bg-base-200 rounded-lg shadow px-6 py-3">
            <span className="font-medium text-base-content">{chain.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportedNetworks;
