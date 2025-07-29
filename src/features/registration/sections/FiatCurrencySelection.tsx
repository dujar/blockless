interface FiatCurrencySelectionProps {
  value: string;
  onChange: (value: string) => void;
  currencies: string[];
}

export const FiatCurrencySelection = ({ value, onChange, currencies }: FiatCurrencySelectionProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. Select Fiat Currency</h2>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full max-w-xs p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      {currencies.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  </div>
);
