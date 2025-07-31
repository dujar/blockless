import { BlockchainCard } from '../components/BlockchainCard';

const BlockchainThemesPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BlockchainCard theme="ethereum" title="Ethereum">
        <p>This card uses the custom 'ethereum' theme.</p>
      </BlockchainCard>
      <BlockchainCard theme="polygon" title="Polygon">
        <p>This card uses the custom 'polygon' theme.</p>
      </BlockchainCard>
      <BlockchainCard theme="avalanche" title="Avalanche">
        <p>This card uses the custom 'avalanche' theme.</p>
      </BlockchainCard>
    </div>
  );
};

export default BlockchainThemesPage;
