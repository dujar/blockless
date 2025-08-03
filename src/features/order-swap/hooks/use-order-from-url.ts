import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { rehydrateOrderData } from '../lib/url-serializer'; // Only rehydrateOrderData is needed
import type { RehydratedOrderData, SerializedOrderData } from '../types'; // Import SerializedOrderData for type check
import { decodeOrderFromUrlParam } from '../lib/url-serializer';


export const useOrderFromUrl = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<RehydratedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Retrieve the base64 encoded string from the 'id' parameter
    const encodedOrderIdParam = searchParams.get('id'); 
    
    if (!encodedOrderIdParam) {
      setError('No order ID found in URL. Order details cannot be loaded.');
      setLoading(false);
      return;
    }

    try {
      // Decode the base64 string directly
      const serializedData: SerializedOrderData = decodeOrderFromUrlParam(encodedOrderIdParam);
      
      // Pass the original encoded ID to rehydrateOrderData so it can reconstruct the shareable URL
      const rehydratedOrder = rehydrateOrderData(serializedData, encodedOrderIdParam); 
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
