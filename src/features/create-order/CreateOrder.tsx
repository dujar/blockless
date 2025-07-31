import { Link } from 'react-router-dom';
import { useCreateOrderForm } from './hooks/useCreateOrderForm';
import FiatAmountInputSection from './sections/FiatAmountInputSection';
import OrderDetailsSection from './sections/OrderDetailsSection';
import OrderQRCodeDisplaySection from './sections/OrderQRCodeDisplaySection';

const CreateOrder = () => {
    const form = useCreateOrderForm();

    if (!form.isLoaded) {
        return <div className="text-center p-8">Loading configuration...</div>;
    }

    if (!form.isRegistered) {
        return (
            <div className="text-center bg-white dark:bg-primary-950 p-8 rounded-2xl shadow-lg shadow-dynamic max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Merchant Profile Not Found</h2>
                <p className="text-gray-700 dark:text-gray-400 mb-6">
                    To create an order, you first need to register your payment preferences.
                </p>
                <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition">
                    Register Now
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {form.step === 1 && <FiatAmountInputSection form={form} />}
            {form.step === 2 && form.order && <OrderDetailsSection form={form} />}
            {form.step === 3 && form.order && <OrderQRCodeDisplaySection form={form} />}
        </div>
    );
};

export default CreateOrder;
