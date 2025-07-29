// import { NetworkEnum } from "@1inch/cross-chain-sdk";

export const defaultTheme = {
  bg: "bg-gray-50 dark:bg-gray-800/20",
  border: "border-gray-200 dark:border-gray-700",
  text: "text-gray-800 dark:text-gray-200",
  label: "text-gray-700 dark:text-gray-300",
  button: "bg-gray-500 hover:bg-gray-600 text-white",
  secondaryButton: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
};

export const blockchainData = [
  {
    "id": "ethereum",
    "name": "Ethereum",
    "chainId": 1,
    "networkId": 1, // NetworkEnum.ETHEREUM,
    "icon": "ethereum",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-indigo-50 dark:bg-indigo-900/20",
      "border": "border-indigo-200 dark:border-indigo-800",
      "text": "text-indigo-800 dark:text-indigo-200",
      "label": "text-indigo-700 dark:text-indigo-300",
      "button": "bg-indigo-500 hover:bg-indigo-600 text-white",
      "secondaryButton": "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200",
    }
  },
  {
    "id": "arbitrum",
    "name": "Arbitrum",
    "chainId": 42161,
    "networkId": 42161, // NetworkEnum.ARBITRUM,
    "icon": "arbitrum",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-blue-50 dark:bg-blue-900/20",
      "border": "border-blue-200 dark:border-blue-800",
      "text": "text-blue-800 dark:text-blue-200",
      "label": "text-blue-700 dark:text-blue-300",
      "button": "bg-blue-500 hover:bg-blue-600 text-white",
      "secondaryButton": "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200",
    }
  },
  {
    "id": "avalanche",
    "name": "Avalanche",
    "chainId": 43114,
    "networkId": 43114, // NetworkEnum.AVALANCHE,
    "icon": "avalanche",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-red-50 dark:bg-red-900/20",
      "border": "border-red-200 dark:border-red-800",
      "text": "text-red-800 dark:text-red-200",
      "label": "text-red-700 dark:text-red-300",
      "button": "bg-red-500 hover:bg-red-600 text-white",
      "secondaryButton": "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200",
    }
  },
  {
    "id": "bnb",
    "name": "BNB Chain",
    "chainId": 56,
    "networkId": 56, // NetworkEnum.BINANCE,
    "icon": "binance",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-yellow-50 dark:bg-yellow-900/20",
      "border": "border-yellow-200 dark:border-yellow-800",
      "text": "text-yellow-800 dark:text-yellow-200",
      "label": "text-yellow-700 dark:text-yellow-300",
      "button": "bg-yellow-500 hover:bg-yellow-600 text-black",
      "secondaryButton": "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200",
    }
  },
  {
    "id": "gnosis",
    "name": "Gnosis Chain",
    "chainId": 100,
    "networkId": 100, // NetworkEnum.GNOSIS,
    "icon": "gnosis",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-emerald-50 dark:bg-emerald-900/20",
      "border": "border-emerald-200 dark:border-emerald-800",
      "text": "text-emerald-800 dark:text-emerald-200",
      "label": "text-emerald-700 dark:text-emerald-300",
      "button": "bg-emerald-500 hover:bg-emerald-600 text-white",
      "secondaryButton": "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200",
    }
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
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-red-50 dark:bg-red-900/20",
      "border": "border-red-200 dark:border-red-800",
      "text": "text-red-800 dark:text-red-200",
      "label": "text-red-700 dark:text-red-300",
      "button": "bg-red-500 hover:bg-red-600 text-white",
      "secondaryButton": "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200",
    }
  },
  {
    "id": "polygon",
    "name": "Polygon",
    "chainId": 137,
    "networkId": 137, // NetworkEnum.POLYGON,
    "icon": "polygon",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-violet-50 dark:bg-violet-900/20",
      "border": "border-violet-200 dark:border-violet-800",
      "text": "text-violet-800 dark:text-violet-200",
      "label": "text-violet-700 dark:text-violet-300",
      "button": "bg-violet-500 hover:bg-violet-600 text-white",
      "secondaryButton": "bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-800 dark:text-violet-200",
    }
  },
  {
    "id": "zksync",
    "name": "zkSync Era",
    "chainId": 324,
    "networkId": 324, // NetworkEnum.ZKSYNC,
    "icon": "zksync",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-gray-100 dark:bg-gray-800",
      "border": "border-gray-300 dark:border-gray-600",
      "text": "text-gray-900 dark:text-gray-100",
      "label": "text-gray-800 dark:text-gray-200",
      "button": "bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:text-black dark:hover:bg-white",
      "secondaryButton": "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
    }
  },
  {
    "id": "base",
    "name": "Base",
    "chainId": 8453,
    "networkId": 8453, // NetworkEnum.COINBASE,
    "icon": "base",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-blue-50 dark:bg-blue-900/20",
      "border": "border-blue-200 dark:border-blue-800",
      "text": "text-blue-800 dark:text-blue-200",
      "label": "text-blue-700 dark:text-blue-300",
      "button": "bg-blue-500 hover:bg-blue-600 text-white",
      "secondaryButton": "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200",
    }
  },
  {
    "id": "linea",
    "name": "Linea",
    "chainId": 59144,
    "networkId": 59144, // NetworkEnum.LINEA,
    "icon": "linea",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-gray-100 dark:bg-gray-800",
      "border": "border-gray-300 dark:border-gray-600",
      "text": "text-gray-900 dark:text-gray-100",
      "label": "text-gray-800 dark:text-gray-200",
      "button": "bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:text-black dark:hover:bg-white",
      "secondaryButton": "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
    }
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
