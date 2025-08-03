import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rehydrateOrderData } from '../lib/url-serializer'; // Only rehydrateOrderData is needed
import type { RehydratedOrderData, SerializedOrderData } from '../types'; // Import SerializedOrderData for type check

export const useOrderFromUrl = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<RehydratedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const orderId = searchParams.get('id'); // Change from 'order' to 'id'

    if (!orderId) {
      setError('No order ID found in URL. Order details cannot be loaded.');
      setLoading(false);
      return;
    }

    try {
      // Retrieve serialized data from sessionStorage using the ID
      const storedOrderJson = sessionStorage.getItem(`order_${orderId}`);
      if (!storedOrderJson) {
        setError('Order not found or has expired. Please create a new order.');
        setLoading(false);
        return;
      }
      
      const serializedData: SerializedOrderData = JSON.parse(storedOrderJson);
      const rehydratedOrder = rehydrateOrderData(serializedData);
      setOrder(rehydratedOrder);
    } catch (e) {
      setError((e as Error).message || 'Failed to parse order data from URL.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  return { order, loading, error };
};

