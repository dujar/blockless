import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMerchantConfig } from '../../../hooks/useMerchantConfig';
import type { TokenInfoDto } from '../../../services/types';
import { blockchainData } from '../../../data/blockchains';
import { getCurrencyDataFromCountries, getTokenLogoURI, NATIVE_TOKENS_INFO, COMMON_STABLECOINS_INFO, getCategory, TOKEN_CATEGORIES } from '../../../utils/token-helpers';
import { countries } from '../../../data/countries';
import type { MerchantChainConfig } from '../../../types';
import { serializeOrderData } from '../../order-swap/lib/url-serializer'; // Only serializeOrderData is needed for storage

export interface OrderChainConfig extends Omit<MerchantChainConfig, 'tokens'> {
    chainId: number;
    tokens: { symbol: string; amount: string; info: TokenInfoDto }[];
}

export interface OrderData {
    fiatAmount: number;
    fiatCurrency: string;
    chains: OrderChainConfig[];
    orderSwapUrl: string;
    crossChainUrl: string; // Add crossChainUrl to OrderData to align with RehydratedOrderData
}

export const useCreateOrderForm = () => {
    const { config, isRegistered, isLoaded } = useMerchantConfig();
    const [fiatAmountInput, setFiatAmountInput] = useState('');
    const [order, setOrder] = useState<OrderData | null>(null);
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState('');
    const [mockPrices, setMockPrices] = useState<Record<string, number>>({
        'ETH': 3500, 'WETH': 3500, 'MATIC': 0.7, 'BNB': 600, 'AVAX': 35,
        'USDC': 1, 'DAI': 1, 'USDT': 1,
    });
    const [lastPriceUpdate, setLastPriceUpdate] = useState<Date>(new Date());
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [tokenInfoMap, setTokenInfoMap] = useState<Record<string, TokenInfoDto>>({});

    const currenciesData = useMemo(() => getCurrencyDataFromCountries(countries), []);
    const selectedCurrencyInfo = useMemo(() => currenciesData.find(c => c.code === config?.fiatCurrency), [currenciesData, config?.fiatCurrency]);

    const simulatePriceUpdate = useCallback(() => {
        setLoadingPrices(true);
        setTimeout(() => {
            const newPrices: Record<string, number> = {};
            for (const symbol in mockPrices) {
                newPrices[symbol] = mockPrices[symbol] * (1 + (Math.random() - 0.5) * 0.02); // +/- 1%
            }
            setMockPrices(newPrices);
            setLastPriceUpdate(new Date());
            setLoadingPrices(false);
        }, 500);
    }, [mockPrices]);

    useEffect(() => {
        simulatePriceUpdate();

        if (config?.chains && config.chains.length > 0) {
            const updatedTokenInfoMap: Record<string, TokenInfoDto> = {};
            config.chains.forEach(chainConfig => {
                const chainId = blockchainData.find(b => b.name === chainConfig.name)?.chainId;
                if (chainId) {
                    chainConfig.tokens.forEach(symbol => {
                        const tokenIdentifier = `${chainId}-${symbol}`;
                        let tokenAddress: string = `0x${'a'.repeat(40)}`; // Default mock address
                        let decimals: number = 18;
                        const tags: string[] = [];

                        // Prioritize native token info
                        const nativeInfo = NATIVE_TOKENS_INFO[chainConfig.name];
                        if (nativeInfo && nativeInfo.symbol === symbol) {
                            tokenAddress = nativeInfo.address;
                            decimals = nativeInfo.decimals;
                            tags.push('native');
                        } else {
                            // Then common stablecoin info
                            const stablecoinInfo = COMMON_STABLECOINS_INFO.find(sc => sc.chainId === chainId && sc.symbol === symbol);
                            if (stablecoinInfo) {
                                tokenAddress = stablecoinInfo.address;
                                decimals = stablecoinInfo.decimals;
                                tags.push('PEG:stablecoin');
                            }
                        }

                        // Add risk tags for mock purposes if not native/stablecoin
                        if (!tags.includes('native') && !tags.includes('PEG:stablecoin')) {
                            if (symbol === 'XYZ') tags.push('RISK:suspicious');
                            if (symbol === 'MAL') tags.push('RISK:malicious');
                        }

                        const logoURI = getTokenLogoURI(tokenAddress, symbol, chainConfig.name);
                        updatedTokenInfoMap[tokenIdentifier] = {
                            address: tokenAddress, chainId, decimals, extensions: {}, logoURI, name: symbol, symbol, tags,
                        };
                    });
                }
            });
            setTokenInfoMap(updatedTokenInfoMap);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config?.chains]);

    const handleCreateOrder = useCallback(() => {
        if (!config || !fiatAmountInput) return;
        const amount = parseFloat(fiatAmountInput);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const newOrder: OrderData = {
            fiatAmount: amount,
            fiatCurrency: config.fiatCurrency,
            chains: config.chains.map(chainConfig => {
                const chainId = blockchainData.find(b => b.name === chainConfig.name)?.chainId;
                if (!chainId) {
                    return { ...chainConfig, chainId: 0, tokens: [] }; // Handle case where chainId is not found
                }

                const processedTokens: { symbol: string; amount: string; info: TokenInfoDto }[] = [];
                chainConfig.tokens.forEach(tokenSymbol => {
                    const price = mockPrices[tokenSymbol] || 0;
                    const cryptoAmount = price > 0 ? (amount / price).toFixed(6) : '0.000000';
                    const tokenIdentifier = `${chainId}-${tokenSymbol}`;
                    const tokenDetails = tokenInfoMap[tokenIdentifier];
                    if (tokenDetails) {
                        processedTokens.push({ symbol: tokenSymbol, amount: cryptoAmount, info: tokenDetails });
                    } else {
                        // Fallback for token details if not found in map (shouldn't happen with current logic)
                        processedTokens.push({
                            symbol: tokenSymbol, amount: cryptoAmount, info: {
                                address: '0x' + (Math.random() * 0xffffff).toString(16).padEnd(40, '0'), // Mock address
                                chainId: chainId!, decimals: 18, extensions: {},
                                logoURI: getTokenLogoURI('0x', tokenSymbol, chainConfig.name), name: tokenSymbol, symbol: tokenSymbol, tags: []
                            }
                        });
                    }
                });

                processedTokens.sort((a, b) => {
                    const aHasAmount = parseFloat(a.amount) > 0;
                    const bHasAmount = parseFloat(b.amount) > 0;
                    if (aHasAmount !== bHasAmount) return aHasAmount ? -1 : 1;
                    const categoryA = getCategory(a.info);
                    const categoryB = getCategory(b.info);
                    const orderA = Object.values(TOKEN_CATEGORIES).find(c => c.label === categoryA)?.order ?? 99;
                    const orderB = Object.values(TOKEN_CATEGORIES).find(c => c.label === categoryB)?.order ?? 99;
                    if (orderA !== orderB) return orderA - orderB;
                    return a.symbol.localeCompare(b.symbol);
                });
                return { ...chainConfig, chainId: chainId, tokens: processedTokens };
            }),
            orderSwapUrl: '', // Will be set below
            crossChainUrl: '', // Will be set below
        };

        // Generate a short ID for the internal order page link
        const orderId = Math.random().toString(36).substring(2, 15); // Simple random ID
        const serializableOrderForStorage = serializeOrderData(newOrder); // Use serializeOrderData
        sessionStorage.setItem(`order_${orderId}`, JSON.stringify(serializableOrderForStorage));
        newOrder.orderSwapUrl = `${window.location.origin}/order?id=${serializableOrderForStorage}`;
        
        // Generate crossChainUrl for direct 1inch app link (combined dst params)
        const crossChainParams = new URLSearchParams();
        newOrder.chains.forEach(chain => {
            chain.tokens.forEach(token => {
                if (parseFloat(token.amount) > 0 && chain.address && token.info.symbol) {
                    // Use actual token address if available, otherwise symbol as per 1inch API format
                    // For native tokens, 1inch typically expects the chainId or a special '0xeeee' address,
                    // but sometimes the symbol is also accepted depending on context.
                    // For simplicity, using the actual address for ERC20s and symbol for native or mock cases.
                    const tokenIdentifier = token.info.address !== 'native' && !token.info.address.startsWith('0x0000000000000000000000000000000000000000') // Check for mock zero address
                        ? token.info.address
                        : token.info.symbol; // Fallback to symbol for native or mock addresses
                    const dst = `${token.info.chainId}:${token.amount}:${tokenIdentifier}:${chain.address}`;
                    crossChainParams.append('dst', dst);
                }
            });
        });

        if (crossChainParams.toString()) {
            newOrder.crossChainUrl = `https://app.1inch.io/swap?${crossChainParams.toString()}`;
        } else {
            newOrder.crossChainUrl = ''; // No valid cross-chain swap if no tokens with amounts
        }
        
        setOrder(newOrder);
        setStep(2);
        // Determine initial active tab based on generated URLs
        const firstValidTab = newOrder.orderSwapUrl ? 'order-swap' : (newOrder.chains.some(chain => chain.tokens.some(token => parseFloat(token.amount) > 0)) ? 'wallet-transfers' : '');
        setActiveTab(firstValidTab);

    }, [config, fiatAmountInput, mockPrices, tokenInfoMap]);

    return {
        config, isRegistered, isLoaded,
        fiatAmountInput, setFiatAmountInput,
        order, setOrder,
        step, setStep,
        activeTab, setActiveTab,
        lastPriceUpdate,
        loadingPrices,
        currenciesData,
        selectedCurrencyInfo,
        handleCreateOrder,
        simulatePriceUpdate,
    };
};

