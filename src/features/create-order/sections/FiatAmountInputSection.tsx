import type { useCreateOrderForm } from '../hooks/useCreateOrderForm';

type FiatAmountInputProps = {
    form: ReturnType<typeof useCreateOrderForm>;
};

const FiatAmountInputSection = ({ form }: FiatAmountInputProps) => {
    const {
        fiatAmountInput,
        setFiatAmountInput,
        handleCreateOrder,
        config,
        selectedCurrencyInfo
    } = form;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (fiatAmountInput && parseFloat(fiatAmountInput) > 0) {
                handleCreateOrder();
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg shadow-dynamic">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create a New Order</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Enter the desired amount in your preferred fiat currency.
            </p>
            <div className="mb-8">
                <label htmlFor="fiat-amount-input" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    Order Amount
                </label>
                <div className="relative rounded-lg shadow-sm flex items-center bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-primary-600">
                    <div className="flex items-center pl-3 pr-2">
                        <div className="flex -space-x-2 mr-2 flex-shrink-0">
                            {selectedCurrencyInfo?.countries.slice(0, 3).map(country => (
                                <img key={country.name} src={country.flag} alt={country.name} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                            ))}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                            {selectedCurrencyInfo?.symbol || config?.fiatCurrency}
                        </span>
                    </div>
                    <input
                        id="fiat-amount-input"
                        type="number"
                        value={fiatAmountInput}
                        onChange={e => setFiatAmountInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="block flex-1 py-3 pr-3 bg-transparent text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-2xl sm:leading-6 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                    />
                    <div className="flex items-center pr-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {selectedCurrencyInfo?.code || config?.fiatCurrency}
                        </span>
                    </div>
                </div>
            </div>
            <button
                onClick={handleCreateOrder}
                disabled={!fiatAmountInput || parseFloat(fiatAmountInput) <= 0}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Generate Payment Options
            </button>
        </div>
    );
};

export default FiatAmountInputSection;
