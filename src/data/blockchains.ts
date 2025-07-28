// import { NetworkEnum } from "@1inch/cross-chain-sdk";

export const blockchainData = [
  {
    "id": "ethereum",
    "name": "Ethereum",
    "chainId": 1,
    "networkId": 1, // NetworkEnum.ETHEREUM,
    "icon": "ethereum",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "arbitrum",
    "name": "Arbitrum",
    "chainId": 42161,
    "networkId": 42161, // NetworkEnum.ARBITRUM,
    "icon": "arbitrum",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "avalanche",
    "name": "Avalanche",
    "chainId": 43114,
    "networkId": 43114, // NetworkEnum.AVALANCHE,
    "icon": "avalanche",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "bnb",
    "name": "BNB Chain",
    "chainId": 56,
    "networkId": 56, // NetworkEnum.BINANCE,
    "icon": "binance",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "gnosis",
    "name": "Gnosis Chain",
    "chainId": 100,
    "networkId": 100, // NetworkEnum.GNOSIS,
    "icon": "gnosis",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "solana",
    "name": "Solana",
    "chainId": null,
    "networkId": 13998, // NetworkEnum.SOLANA, (Placeholder, actual value might differ)
    "icon": "solana",
    "isEVM": false,
    "walletFormat": "base58"
  },
  {
    "id": "sonic",
    "name": "Sonic",
    "chainId": null,
    "networkId": 200000, // NetworkEnum.SONIC, (Placeholder, actual value might differ)
    "icon": "sonic",
    "isEVM": false,
    "walletFormat": "unknown"
  },
  {
    "id": "optimism",
    "name": "Optimism",
    "chainId": 10,
    "networkId": 10, // NetworkEnum.OPTIMISM,
    "icon": "optimism",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "polygon",
    "name": "Polygon",
    "chainId": 137,
    "networkId": 137, // NetworkEnum.POLYGON,
    "icon": "polygon",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "zksync",
    "name": "zkSync Era",
    "chainId": 324,
    "networkId": 324, // NetworkEnum.ZKSYNC,
    "icon": "zksync",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "base",
    "name": "Base",
    "chainId": 8453,
    "networkId": 8453, // NetworkEnum.COINBASE,
    "icon": "base",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "linea",
    "name": "Linea",
    "chainId": 59144,
    "networkId": 59144, // NetworkEnum.LINEA,
    "icon": "linea",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "unichain",
    "name": "Unichain",
    "chainId": null,
    "networkId": 100000, // NetworkEnum.UNICHAIN, (Placeholder, actual value might differ)
    "icon": "unichain",
    "isEVM": false,
    "walletFormat": "unknown"
  }
];