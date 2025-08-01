import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeOrderFromUrlParam, rehydrateOrderData } from '../lib/url-serializer';
import type { RehydratedOrderData } from '../types';

export const useOrderFromUrl = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<RehydratedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const encodedOrder = searchParams.get('order');

    if (!encodedOrder) {
      setError('No order data found in URL.');
      setLoading(false);
      return;
    }

    try {
      const serializedData = decodeOrderFromUrlParam(encodedOrder);
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
