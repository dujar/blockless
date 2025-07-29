import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface UseSwapFormOptions {
  onFormReset?: () => void;
}

export const useSwapForm = ({ onFormReset }: UseSwapFormOptions = {}) => {
  const { address, isConnected } = useAccount();

  const [formData, setFormData] = useState({
    blockchain: '',
    token: '',
    amount: '',
    targetAddress: ''
  });

  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);

  const validateAddress = useCallback((address: string) => {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsAddressValid(isValid);
    return isValid;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'targetAddress') {
      validateAddress(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (isConnected && address) {
      setFormData(prev => ({
        ...prev,
        targetAddress: address
      }));
      validateAddress(address);
    }
  }, [isConnected, address, validateAddress]);

  const isFormValid = useCallback(() => {
    return (
      formData.blockchain.trim() !== '' &&
      formData.token.trim() !== '' &&
      formData.amount.trim() !== '' &&
      parseFloat(formData.amount) > 0 &&
      formData.targetAddress.trim() !== '' &&
      isAddressValid === true
    );
  }, [formData, isAddressValid]);

  const generateQRCodeURL = useCallback(() => {
    const dst = `${formData.blockchain}:${formData.amount}:${formData.token}:${formData.targetAddress}`;
    const params = new URLSearchParams();
    params.append('dst', dst);
    // Add src parameter if you have it in your form
    // params.append('src', src);
    return `${window.location.origin}/swap?${params.toString()}`;
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData({
      blockchain: '',
      token: '',
      amount: '',
      targetAddress: ''
    });
    setIsAddressValid(null);
    onFormReset?.();
  }, [onFormReset]);
  
  return {
    formData,
    handleInputChange,
    handleReset,
    isAddressValid,
    isFormValid,
    generateQRCodeURL,
  };
};

export type UseSwapFormReturn = ReturnType<typeof useSwapForm>;
