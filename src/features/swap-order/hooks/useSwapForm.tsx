import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { QuoterService } from '../../../services/fusion-service'; // Import QuoterService
import type { GetQuoteOutput, GetQuoteParams } from '../../../services/types'; // Import quote output type
import { blockchainData } from '../../../data/blockchains';
import { NATIVE_TOKENS_INFO, COMMON_STABLECOINS_INFO } from '../../../utils/token-helpers'; // Import native and common stablecoin tokens info
import type { TokenInfo } from '../../../data/tokens'; // Import TokenInfo from src/data/tokens

const quoterService = new QuoterService(); // Initialize the service

export interface UseSwapFormOptions {
  onFormReset?: () => void;
}

export const useSwapForm = ({ onFormReset }: UseSwapFormOptions = {}) => {
  const { address: connectedAddress, isConnected, chain: connectedChain } = useAccount();

  const [formData, setFormData] = useState({
    blockchain: '', // Source blockchain name (e.g., "Ethereum")
    sourceToken: null as TokenInfo | null, // Store full TokenInfo object for source token
    amount: '',      // Source amount string (e.g., "0.5")
    targetAddress: '', // Destination address (e.g., "0x...")
    fiatAmount: 0,   // Dummy value for deeplink component
    fiatCurrency: 'USD', // Dummy value for deeplink component
    token: null as TokenInfo | null, // Selected token for deeplink
  });

  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);
  const [quoteData, setQuoteData] = useState<GetQuoteOutput | null>(null); // State for the quote API response
  const [isQuoteLoading, setIsQuoteLoading] = useState(false); // State for loading status
  const [quoteError, setQuoteError] = useState<string | null>(null); // State for API errors

  const validateAddress = useCallback((address: string) => {
    const isValid = typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsAddressValid(isValid);
    return isValid;
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'targetAddress') {
        validateAddress(value);
    }
  }, [validateAddress]);

  const setSourceTokenInForm = useCallback((token: TokenInfo | null) => {
    setFormData(prev => ({
      ...prev,
      sourceToken: token
    }));
  }, []);

  useEffect(() => {
    if (isConnected && connectedAddress && formData.targetAddress.toLowerCase() !== connectedAddress.toLowerCase()) {
      setFormData(prev => ({
        ...prev,
        targetAddress: connectedAddress
      }));
      validateAddress(connectedAddress);
    }
    if (isConnected && connectedChain && formData.blockchain !== connectedChain.name) {
        setFormData(prev => ({
            ...prev,
            blockchain: connectedChain.name,
        }));
    }
  }, [isConnected, connectedAddress, connectedChain, validateAddress, formData.targetAddress, formData.blockchain]);

  const isFormValid = useCallback(() => {
    return (
      formData.blockchain.trim() !== '' &&
      formData.sourceToken !== null &&
      formData.amount.trim() !== '' &&
      parseFloat(formData.amount) > 0 &&
      formData.targetAddress.trim() !== '' &&
      isAddressValid === true
    );
  }, [formData, isAddressValid]);

  const generateSwapQuote = useCallback(async (
    dstChainName: string, 
    dstTokenInfo: { symbol?: string; address?: string; },
  ): Promise<string | null> => {
    setIsQuoteLoading(true);
    setQuoteError(null);
    setQuoteData(null);

    try {
        const srcChainInfo = blockchainData.find(c => c.name === formData.blockchain);
        if (!srcChainInfo?.chainId) {
            throw new Error(`Invalid source blockchain: ${formData.blockchain}`);
        }

        if (!formData.sourceToken) {
            throw new Error('Source token not selected.');
        }
        
        const nativeSrcToken = NATIVE_TOKENS_INFO[srcChainInfo.name];
        const srcTokenAddress = formData.sourceToken.address === 'native'
            ? nativeSrcToken?.address
            : formData.sourceToken.address;

        if (!srcTokenAddress) {
            throw new Error(`Could not resolve source token address for ${formData.sourceToken.symbol}`);
        }

        const dstChainInfo = blockchainData.find(c => c.name === dstChainName);
        if (!dstChainInfo?.chainId) {
            throw new Error(`Invalid destination blockchain: ${dstChainName}`);
        }
        
        let finalDstTokenAddress: string;
        if (dstTokenInfo.address) {
            finalDstTokenAddress = dstTokenInfo.address;
        } else if (dstTokenInfo.symbol) {
            const nativeDstToken = NATIVE_TOKENS_INFO[dstChainName];
            const stablecoinDstToken = COMMON_STABLECOINS_INFO.find(sc => sc.chainId === dstChainInfo.chainId && sc.symbol.toUpperCase() === dstTokenInfo.symbol!.toUpperCase());

            if (nativeDstToken && nativeDstToken.symbol.toUpperCase() === dstTokenInfo.symbol.toUpperCase()) {
                finalDstTokenAddress = nativeDstToken.address;
            } else if (stablecoinDstToken) {
                finalDstTokenAddress = stablecoinDstToken.address;
            } else {
                throw new Error(`Could not resolve destination token address for symbol: ${dstTokenInfo.symbol}.`);
            }
        } else {
            throw new Error('Destination token info is incomplete.');
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(srcTokenAddress)) {
            throw new Error(`Invalid source token address format: ${srcTokenAddress}`);
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(finalDstTokenAddress)) {
            throw new Error(`Invalid destination token address format: ${finalDstTokenAddress}`);
        }

        const params: GetQuoteParams = {
            srcChain: srcChainInfo.chainId,
            dstChain: dstChainInfo.chainId,
            srcTokenAddress: srcTokenAddress,
            dstTokenAddress: finalDstTokenAddress,
            amount: parseFloat(formData.amount),
            walletAddress: formData.targetAddress,
            enableEstimate: true,
        };

        const quote = await quoterService.getQuote(params);
        setQuoteData(quote);

        const oneInchAppUrl = `https://app.1inch.io/#/${srcChainInfo.chainId}/simple/swap` +
            `/${srcTokenAddress}` +
            `/${finalDstTokenAddress}` +
            `?receiver=${formData.targetAddress}` +
            `&amount=${quote.srcTokenAmount}`;
        
        return oneInchAppUrl;

    } catch (err) {
        console.error('Failed to generate swap quote:', err);
        setQuoteError((err as Error).message);
        return null;
    } finally {
        setIsQuoteLoading(false);
    }
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData({
      blockchain: '',
      sourceToken: null,
      amount: '',
      targetAddress: '',
      fiatAmount: 0,
      fiatCurrency: 'USD',
      token: null as TokenInfo | null, // Reset token
    });
    setIsAddressValid(null);
    setQuoteData(null);
    setIsQuoteLoading(false);
    setQuoteError(null);
    onFormReset?.();
  }, [onFormReset]);
  
  return {
    formData,
    handleInputChange,
    setSourceTokenInForm,
    handleReset,
    isAddressValid,
    isFormValid,
    generateSwapQuote,
    quoteData,
    isQuoteLoading,
    quoteError,
  };
};

export type UseSwapFormReturn = ReturnType<typeof useSwapForm>;
