import { useRegistrationForm } from '../features/registration/hooks/useRegistrationForm';
import { FiatCurrencySelection } from '../features/registration/sections/FiatCurrencySelection';
import { ChainConfiguration } from '../features/registration/sections/ChainConfiguration';
import { ConfigurationSummary } from '../features/registration/sections/ConfigurationSummary';

const RegisterPage = () => {
  const form = useRegistrationForm();
  
  if (!form.isLoaded) {
      return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Merchant Registration</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Configure your payment preferences. This is saved in your browser.
      </p>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <FiatCurrencySelection 
            value={form.fiatCurrency} 
            onChange={form.setFiatCurrency} 
            currencies={form.FIAT_CURRENCIES} 
          />
          
          <ChainConfiguration form={form} />
          
          {/* Save Button */}
          <div className="flex justify-end items-center">
              {form.isSaved && (
                  <span className="text-green-600 dark:text-green-400 mr-4">Configuration Saved!</span>
              )}
            <button
              onClick={form.handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition shadow-lg hover:shadow-xl"
            >
              Save Configuration
            </button>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ConfigurationSummary chains={form.chains} fiatCurrency={form.fiatCurrency} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
