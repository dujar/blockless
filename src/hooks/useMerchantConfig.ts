import { useState, useEffect, useCallback } from 'react';
import type { MerchantConfig } from '../types';

const MERCHANT_CONFIG_KEY = 'merchantConfig';

export const useMerchantConfig = () => {
  const [config, setConfig] = useState<MerchantConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem(MERCHANT_CONFIG_KEY);
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error('Failed to load merchant config from localStorage', error);
      localStorage.removeItem(MERCHANT_CONFIG_KEY);
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = useCallback((newConfig: MerchantConfig) => {
    try {
      localStorage.setItem(MERCHANT_CONFIG_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save merchant config to localStorage', error);
    }
  }, []);

  const clearConfig = useCallback(() => {
    try {
      localStorage.removeItem(MERCHANT_CONFIG_KEY);
      setConfig(null);
    } catch (error) {
      console.error('Failed to clear merchant config from localStorage', error);
    }
  }, []);

  return { config, saveConfig, clearConfig, isLoaded, isRegistered: !!config };
};
