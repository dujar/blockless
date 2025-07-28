export interface TokenInfo {
    symbol: string;
    name: string;
    // 'native' for native token, otherwise contract address
    address: string;
    decimals: number;
    chainId: number;
}

export const tokenData: TokenInfo[] = [
    // Ethereum (chainId: 1)
    { symbol: 'ETH', name: 'Ether', address: 'native', decimals: 18, chainId: 1 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, chainId: 1 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, chainId: 1 },
    { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, chainId: 1 },

    // Polygon (chainId: 137)
    { symbol: 'MATIC', name: 'Matic', address: 'native', decimals: 18, chainId: 137 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', decimals: 18, chainId: 137 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, chainId: 137 },

    // BNB Chain (chainId: 56)
    { symbol: 'BNB', name: 'BNB', address: 'native', decimals: 18, chainId: 56 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, chainId: 56 },

    // Arbitrum (chainId: 42161)
    { symbol: 'ETH', name: 'Ether', address: 'native', decimals: 18, chainId: 42161 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, chainId: 42161 },

    // Optimism (chainId: 10)
    { symbol: 'ETH', name: 'Ether', address: 'native', decimals: 18, chainId: 10 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6, chainId: 10 },

    // Avalanche (chainId: 43114)
    { symbol: 'AVAX', name: 'Avalanche', address: 'native', decimals: 18, chainId: 43114 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, chainId: 43114 },
];
