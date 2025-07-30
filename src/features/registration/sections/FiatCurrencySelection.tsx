import { useState, useRef, useEffect, useMemo } from 'react';

// Define the shape of a single currency item, derived from the processed data
export interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  countries: {
    name: string;
    flag: string;
  }[];
}

interface FiatCurrencySelectionProps {
  value: string;
  onChange: (value: string) => void;
  currencies: CurrencyData[];
}

export const FiatCurrencySelection = ({ value, onChange, currencies }: FiatCurrencySelectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = useMemo(() => currencies.find(c => c.code === value) || currencies.find(c => c.code === 'USD') || currencies[0], [currencies, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return currencies;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return currencies.filter(currency =>
      currency.name.toLowerCase().includes(lowerCaseSearch) ||
      currency.code.toLowerCase().includes(lowerCaseSearch) ||
      currency.countries.some(country => country.name.toLowerCase().includes(lowerCaseSearch))
    );
  }, [searchTerm, currencies]);

  const handleSelect = (currencyCode: string) => {
    onChange(currencyCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Select Fiat Currency</h2>
      <div className="relative w-full max-w-xs" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between text-left"
        >
          {selectedCurrency ? (
            <div className="flex items-center truncate">
              <div className="flex -space-x-2 mr-3 flex-shrink-0">
                {selectedCurrency.countries.slice(0, 3).map(country => (
                  <img key={country.name} src={country.flag} alt={country.name} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                ))}
              </div>
              <span className="font-medium truncate">{selectedCurrency.name} ({selectedCurrency.code})</span>
            </div>
          ) : (
            <span>Select Currency</span>
          )}
          <svg className={`w-5 h-5 ml-2 transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search country or currency..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {filteredCurrencies.map(currency => (
                <li
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center truncate">
                    <div className="flex -space-x-2 mr-3 flex-shrink-0">
                      {currency.countries.slice(0, 4).map(country => (
                        <img key={country.name} src={country.flag} alt={country.name} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                      ))}
                      {currency.countries.length > 4 && (
                        <span className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold">
                          +{currency.countries.length - 4}
                        </span>
                      )}
                    </div>
                    <span className="font-medium truncate">{currency.name} ({currency.code})</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">{currency.symbol}</span>
                </li>
              ))}
              {filteredCurrencies.length === 0 && (
                <li className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
