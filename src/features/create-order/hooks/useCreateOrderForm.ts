import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMerchantConfig } from '../../../hooks/useMerchantConfig';
import type { TokenInfoDto } from '../../../services/types';
import { blockchainData } from '../../../data/blockchains';
import { getCurrencyDataFromCountries, getTokenLogoURI, NATIVE_TOKENS_INFO, COMMON_STABLECOINS_INFO, getCategory, TOKEN_CATEGORIES } from '../../../utils/token-helpers';
import { countries } from '../../../data/countries';
import type { MerchantChainConfig } from '../../../types';

export interface OrderChainConfig extends Omit<MerchantChainConfig, 'tokens'> {
    tokens: { symbol: string; amount: string; info: TokenInfoDto }[];
}

export interface OrderData {
    fiatAmount: number;
    fiatCurrency: string;
    chains: OrderChainConfig[];
    crossChainUrl: string;
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
                        let tokenAddress: string = `0x${'a'.repeat(40)}`;
                        let decimals: number = 18;
                        let tags: string[] = [];
                        const nativeInfo = NATIVE_TOKENS_INFO[chainConfig.name];
                        if (nativeInfo && nativeInfo.symbol === symbol) {
                            tokenAddress = nativeInfo.address;
                            decimals = nativeInfo.decimals;
                            tags.push('native');
                        }
                        const stablecoinInfo = COMMON_STABLECOINS_INFO.find(sc => sc.chainId === chainId && sc.symbol === symbol);
                        if (stablecoinInfo) {
                            tokenAddress = stablecoinInfo.address;
                            decimals = stablecoinInfo.decimals;
                            tags.push('PEG:stablecoin');
                        }
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
                const processedTokens: { symbol: string; amount: string; info: TokenInfoDto }[] = [];
                chainConfig.tokens.forEach(tokenSymbol => {
                    const price = mockPrices[tokenSymbol] || 0;
                    const cryptoAmount = price > 0 ? (amount / price).toFixed(6) : '0.000000';
                    const tokenIdentifier = `${chainId}-${tokenSymbol}`;
                    const tokenDetails = tokenInfoMap[tokenIdentifier];
                    if (tokenDetails) {
                        processedTokens.push({ symbol: tokenSymbol, amount: cryptoAmount, info: tokenDetails });
                    } else {
                        processedTokens.push({
                            symbol: tokenSymbol, amount: cryptoAmount, info: {
                                address: '0x' + (Math.random() * 0xffffff).toString(16).padEnd(40, '0'), chainId: chainId!, decimals: 18, extensions: {},
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
                return { ...chainConfig, tokens: processedTokens };
            }),
            crossChainUrl: '',
        };

        const crossChainParams = new URLSearchParams();
        const validDstParams: string[] = [];
        newOrder.chains.forEach(chain => {
            chain.tokens.forEach(token => {
                if (parseFloat(token.amount) > 0 && chain.address && token.info.symbol) {
                    const dst = `${chain.name}:${token.amount}:${token.info.symbol}:${chain.address}`;
                    validDstParams.push(dst);
                }
            });
        });

        if (validDstParams.length > 0) {
            validDstParams.forEach(param => crossChainParams.append('dst', param));
            newOrder.crossChainUrl = `${window.location.origin}/swap?${crossChainParams.toString()}`;
        } else {
            newOrder.crossChainUrl = '';
        }
        
        setOrder(newOrder);
        setStep(2);
        const firstValidChain = newOrder.chains.find(chain => chain.tokens.some(token => parseFloat(token.amount) > 0));
        setActiveTab(firstValidChain?.name || (newOrder.crossChainUrl ? 'cross-chain' : ''));
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
