import { useRegistrationForm } from '../features/registration/hooks/useRegistrationForm';
import { FiatCurrencySelection } from '../features/registration/sections/FiatCurrencySelection';
import { ChainConfiguration } from '../features/registration/sections/ChainConfiguration';
import { ConfigurationSummary } from '../features/registration/sections/ConfigurationSummary';

// ThemeSettings component definition (moved inside the file for self-containment if it's only used here)
const ThemeSettings = ({ darkModeEnabled, setDarkModeEnabled, primaryColor, setPrimaryColor, shadowLevel, setShadowLevel }:
  Pick<ReturnType<typeof useRegistrationForm>, 'darkModeEnabled' | 'setDarkModeEnabled' | 'primaryColor' | 'setPrimaryColor' | 'shadowLevel' | 'setShadowLevel'>
) => {
  const colorOptions = [
    { label: 'Blue (Default)', value: 'blue' },
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
  ];

  const shadowOptions = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium (Default)', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Extra Large', value: 'xl' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg shadow-dynamic">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. Customize Theme</h2>
      <div className="space-y-6">
        {/* Dark Mode Toggle */}
        <div>
          <label htmlFor="dark-mode-toggle" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
            Dark Mode
          </label>
          <label htmlFor="dark-mode-toggle" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="dark-mode-toggle"
              className="sr-only peer"
              checked={darkModeEnabled}
              onChange={(e) => setDarkModeEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-300">
              {darkModeEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {/* Primary Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
            Primary Accent Color
          </label>
          <div className="mt-2 space-y-2">
            {colorOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`color-${option.value}`}
                  name="primaryColor"
                  type="radio"
                  value={option.value}
                  checked={primaryColor === option.value}
                  onChange={() => setPrimaryColor(option.value as 'blue' | 'red' | 'green')}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor={`color-${option.value}`} className="ml-3 block text-sm text-gray-800 dark:text-gray-200">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Shadow Level Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
            Card Shadow Level
          </label>
          <div className="mt-2 space-y-2">
            {shadowOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`shadow-${option.value}`}
                  name="shadowLevel"
                  type="radio"
                  value={option.value}
                  checked={shadowLevel === option.value}
                  onChange={() => setShadowLevel(option.value as 'sm' | 'md' | 'lg' | 'xl')}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor={`shadow-${option.value}`} className="ml-3 block text-sm text-gray-800 dark:text-gray-200">
                  {option.label}
                  {/* Small visual example of the shadow */}
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      Example <span className={`inline-block w-2 h-2 rounded-full border border-gray-300 dark:border-gray-600 shadow-${option.value}`}></span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const RegisterPage = () => {
  const form = useRegistrationForm();
  
  if (!form.isLoaded) {
      return <div className="text-center p-8">Loading configuration...</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Merchant Registration</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
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

          {/* New Theme Settings section */}
          <ThemeSettings
            darkModeEnabled={form.darkModeEnabled}
            setDarkModeEnabled={form.setDarkModeEnabled}
            primaryColor={form.primaryColor}
            setPrimaryColor={form.setPrimaryColor}
            shadowLevel={form.shadowLevel}
            setShadowLevel={form.setShadowLevel}
          />
          
        </div>
        <div className="lg:col-span-1">
          <ConfigurationSummary chains={form.chains} fiatCurrency={form.fiatCurrency} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

