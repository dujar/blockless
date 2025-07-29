import { useRegistrationForm } from '../features/registration/hooks/useRegistrationForm';
import { FiatCurrencySelection } from '../features/registration/sections/FiatCurrencySelection';
import { ChainConfiguration } from '../features/registration/sections/ChainConfiguration';
import { ConfigurationSummary } from '../features/registration/sections/ConfigurationSummary';

const RegisterPage = () => {
  const form = useRegistrationForm();
  
  if (!form.isLoaded) {
      return <div className="text-center p-8">Loading configuration...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Merchant Registration</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Configure your payment preferences. This is saved automatically in your browser.
      </p>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <FiatCurrencySelection 
            value={form.fiatCurrency} 
            onChange={form.setFiatCurrency} 
            currencies={form.currenciesData} 
          />
          
          <ChainConfiguration form={form} />
          
        </div>
        <div className="lg:col-span-1">
          <ConfigurationSummary chains={form.chains} fiatCurrency={form.fiatCurrency} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
