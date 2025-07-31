export interface BlockchainTheme {
  bg: string;
  border: string;
  text: string;
  label: string;
  // button: string; // Removed to use global primary color
  // secondaryButton: string; // Removed to use global primary color
}

export const defaultTheme: BlockchainTheme = {
  bg: "bg-gray-50 dark:bg-primary-900/50", // Adjusted for new dark background logic
  border: "border-gray-200 dark:border-gray-800", // Adjusted for new dark border logic
  text: "text-gray-800 dark:text-gray-200", // Adjusted for new dark text logic
  label: "text-gray-700 dark:text-gray-300", // Adjusted for new dark label logic
};


export interface BlockchainData{
  // please fill
  id: string; // Unique identifier for the blockchain
  name: string; // Display name of the blockchain
  chainId: number | null; // Chain ID, null if not applicable
  networkId: number; // Network ID, used for identification
  icon: string; // Icon name or path for the blockchain
  isEVM: boolean; // Indicates if the blockchain is EVM-compatible
  walletFormat: string; // Wallet address format (e.g., "0x", "base58", etc.)
  theme?: BlockchainTheme; // Optional theme for the blockchain, if different
}

export const blockchainData: BlockchainData[] = [
  {
    "id": "ethereum",
    "name": "Ethereum",
    "chainId": 1,
    "networkId": 1, // NetworkEnum.ETHEREUM,
    "icon": "ethereum",
    "isEVM": true,
    "walletFormat": "0x",
    "theme": {
      "bg": "bg-indigo-50 dark:bg-primary-950",
      "border": "border-indigo-200 dark:border-gray-800",
      "text": "text-indigo-800 dark:text-gray-200",
      "label": "text-indigo-700 dark:text-gray-300",
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
      "bg": "bg-blue-50 dark:bg-primary-950",
      "border": "border-blue-200 dark:border-gray-800",
      "text": "text-blue-800 dark:text-gray-200",
      "label": "text-blue-700 dark:text-gray-300",
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
      "bg": "bg-red-50 dark:bg-primary-950",
      "border": "border-red-200 dark:border-gray-800",
      "text": "text-red-800 dark:text-gray-200",
      "label": "text-red-700 dark:text-gray-300",
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
      "bg": "bg-yellow-50 dark:bg-primary-950",
      "border": "border-yellow-200 dark:border-gray-800",
      "text": "text-yellow-800 dark:text-gray-200",
      "label": "text-yellow-700 dark:text-gray-300",
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
      "bg": "bg-emerald-50 dark:bg-primary-950",
      "border": "border-emerald-200 dark:border-gray-800",
      "text": "text-emerald-800 dark:text-gray-200",
      "label": "text-emerald-700 dark:text-gray-300",
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
      "bg": "bg-red-50 dark:bg-primary-950",
      "border": "border-red-200 dark:border-gray-800",
      "text": "text-red-800 dark:text-gray-200",
      "label": "text-red-700 dark:text-gray-300",
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
      "bg": "bg-violet-50 dark:bg-primary-950",
      "border": "border-violet-200 dark:border-gray-800",
      "text": "text-violet-800 dark:text-gray-200",
      "label": "text-violet-700 dark:text-gray-300",
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
      "bg": "bg-gray-100 dark:bg-primary-950",
      "border": "border-gray-300 dark:border-gray-900",
      "text": "text-gray-900 dark:text-gray-100",
      "label": "text-gray-800 dark:text-gray-200",
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
      "bg": "bg-blue-50 dark:bg-primary-950",
      "border": "border-blue-200 dark:border-gray-800",
      "text": "text-blue-800 dark:text-gray-200",
      "label": "text-blue-700 dark:text-gray-300",
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
      "bg": "bg-gray-100 dark:bg-primary-950",
      "border": "border-gray-300 dark:border-gray-900",
      "text": "text-gray-900 dark:text-gray-100",
      "label": "text-gray-800 dark:text-gray-200",
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
