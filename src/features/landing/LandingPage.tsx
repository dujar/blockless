import { useState } from 'react';
import { useSwapForm } from './hooks/useSwapForm';
import type { UseSwapFormReturn } from './hooks/useSwapForm';
import CreateSwapOrderForm from './sections/CreateSwapOrderForm';
import OrderDisplay from './sections/OrderDisplay';
import SupportedNetworks from '../../components/SupportedNetworks';

const LandingPage = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  
  const handleFormReset = () => {
    setShowQRCode(false);
  };

  const form: UseSwapFormReturn = useSwapForm({ onFormReset: handleFormReset });

  const handleGenerateQR = () => {
    if (form.isFormValid()) {
      setShowQRCode(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Blockless Swap
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Secure cross-chain swaps powered by 1inch Fusion+
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OrderDisplay
          showQRCode={showQRCode}
          qrCodeUrl={form.generateQRCodeURL()}
          formData={form.formData}
          onBackToForm={() => setShowQRCode(false)}
        />
        <CreateSwapOrderForm
          form={form}
          onGenerateQR={handleGenerateQR}
        />
      </div>
      
      <SupportedNetworks />
    </div>
  );
};

export default LandingPage;
