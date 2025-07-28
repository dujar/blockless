import { NetworkEnum } from "@1inch/cross-chain-sdk";

export const blockchainData = [
  {
    "id": "ethereum",
    "name": "Ethereum",
    "chainId": 1,
    "networkId": NetworkEnum.ETHEREUM,
    "icon": "ethereum",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "arbitrum",
    "name": "Arbitrum",
    "chainId": 42161,
    "networkId": NetworkEnum.ARBITRUM,
    "icon": "arbitrum",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "avalanche",
    "name": "Avalanche",
    "chainId": 43114,
    "networkId": NetworkEnum.AVALANCHE,
    "icon": "avalanche",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "bnb",
    "name": "BNB Chain",
    "chainId": 56,
    "networkId": NetworkEnum.BINANCE,
    "icon": "binance",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "gnosis",
    "name": "Gnosis Chain",
    "chainId": 100,
    "networkId": NetworkEnum.GNOSIS,
    "icon": "gnosis",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "solana",
    "name": "Solana",
    "chainId": null,
    "networkId": NetworkEnum.SOLANA,
    "icon": "solana",
    "isEVM": false,
    "walletFormat": "base58"
  },
  {
    "id": "sonic",
    "name": "Sonic",
    "chainId": null,
    "networkId": NetworkEnum.SONIC,
    "icon": "sonic",
    "isEVM": false,
    "walletFormat": "unknown"
  },
  {
    "id": "optimism",
    "name": "Optimism",
    "chainId": 10,
    "networkId": NetworkEnum.OPTIMISM,
    "icon": "optimism",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "polygon",
    "name": "Polygon",
    "chainId": 137,
    "networkId": NetworkEnum.POLYGON,
    "icon": "polygon",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "zksync",
    "name": "zkSync Era",
    "chainId": 324,
    "networkId": NetworkEnum.ZKSYNC,
    "icon": "zksync",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "base",
    "name": "Base",
    "chainId": 8453,
    "networkId": NetworkEnum.COINBASE,
    "icon": "base",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "linea",
    "name": "Linea",
    "chainId": 59144,
    "networkId": NetworkEnum.LINEA,
    "icon": "linea",
    "isEVM": true,
    "walletFormat": "0x"
  },
  {
    "id": "unichain",
    "name": "Unichain",
    "chainId": null,
    "networkId": NetworkEnum.UNICHAIN,
    "icon": "unichain",
    "isEVM": false,
    "walletFormat": "unknown"
  }
];