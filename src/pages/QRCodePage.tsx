
import React from 'react';
import { useMerchantConfig } from '../hooks/useMerchantConfig';
import { QRCodeTabs } from '../components/QRCodeTabs';

const QRCodePage: React.FC = () => {
  const { config, isLoaded } = useMerchantConfig();

  if (!isLoaded) {
    return <div className="p-4 text-center">Loading merchant configuration...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pay with Crypto</h1>
      <QRCodeTabs config={config} />
    </div>
  );
};

export default QRCodePage;
