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
        <div className="bg-base-100 p-4 sm:p-8 rounded-2xl shadow-lg shadow-dynamic">
            <h1 className="text-3xl font-bold text-base-content mb-6">Create a New Order</h1>
            <p className="text-lg text-neutral-content mb-6">
                Enter the desired amount in your preferred fiat currency.
            </p>
            <div className="mb-8">
                <label htmlFor="fiat-amount-input" className="block text-sm font-medium text-base-content mb-2">
                    Order Amount
                </label>
                <div className="relative rounded-lg shadow-sm flex items-center bg-base-200 ring-1 ring-inset ring-gray-300 dark:ring-primary-800 focus-within:ring-2 focus-within:ring-primary-600">
                    <div className="flex items-center pl-3 pr-2">
                        <div className="flex -space-x-2 mr-2 flex-shrink-0">
                            {selectedCurrencyInfo?.countries.slice(0, 3).map(country => (
                                <img key={country.name} src={country.flag} alt={country.name} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-900 object-cover" />
                            ))}
                        </div>
                        <span className="text-base-content font-semibold text-base">
                            {selectedCurrencyInfo?.symbol || config?.fiatCurrency}
                        </span>
                    </div>
                    <input
                        id="fiat-amount-input"
                        type="number"
                        value={fiatAmountInput}
                        onChange={e => setFiatAmountInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="block flex-1 py-3 pr-3 bg-transparent text-2xl font-bold text-gray-900 placeholder:text-neutral-content focus:outline-none focus:ring-0 sm:text-2xl sm:leading-6 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                    />
                    <div className="flex items-center pr-3">
                        <span className="text-neutral-content text-sm font-medium">
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
