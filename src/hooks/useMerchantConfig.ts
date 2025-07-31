import { useState, useCallback } from 'react';
import type { MerchantConfig } from '../types';

const MERCHANT_CONFIG_KEY = 'merchantConfig';

/**
 * Synchronously loads the merchant configuration from localStorage.
 * This function is designed to be used during initial useState calls to avoid
 * a flicker of default values if config is already present.
 * @returns The loaded MerchantConfig or null if not found/error.
 */
const getInitialConfig = (): MerchantConfig | null => {
  try {
    const storedConfig = localStorage.getItem(MERCHANT_CONFIG_KEY);
    return storedConfig ? JSON.parse(storedConfig) : null;
  } catch (error) {
    console.error('Failed to load merchant config from localStorage during initialization', error);
    // Clear potentially corrupted data if JSON parsing fails
    localStorage.removeItem(MERCHANT_CONFIG_KEY);
    return null;
  }
};

export const useMerchantConfig = () => {
  // Initialize config by trying to load from localStorage immediately.
  const [config, setConfig] = useState<MerchantConfig | null>(getInitialConfig());
  // isLoaded is true initially because we attempted to load the config synchronously.
  // It will reflect whether a config was found or not via the 'config' state itself.
  const [isLoaded] = useState(true); 

  // The saveConfig and clearConfig functions remain the same, ensuring updates
  // to localStorage and React state are consistent.
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

