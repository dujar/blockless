// Validated types
type SwapAddress = `0x${string}` & { readonly __brand: unique symbol };
type SwapTokenSymbol = string & { readonly __brand: unique symbol };
type SwapAmount = string & { readonly __brand: unique symbol };
type BlockchainName = string & { readonly __brand: unique symbol };

// Token information
export interface SwapTokenInfo {
  address?: SwapAddress;
  symbol?: SwapTokenSymbol;
  decimals?: number;
}

// Enhanced SwapInfo with more flexibility
export type SwapInfo = {
  blockchain: BlockchainName;
  amount: SwapAmount;
  token: {
    symbol?: SwapTokenSymbol;
    address?: SwapAddress;
  };
  destinationAddress: SwapAddress;
};

// Main swap parameters interface
export interface SwapParams {
  dst: SwapInfo[];
  src?: SwapInfo;
}

// Validation functions
const isValidAddress = (address: string): address is SwapAddress => {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidTokenSymbol = (symbol: string): symbol is SwapTokenSymbol => {
  return typeof symbol === 'string' && /^[A-Z0-9]{2,15}$/.test(symbol);
};

const isValidAmount = (amount: string): amount is SwapAmount => {
  return typeof amount === 'string' && /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
};

const isValidBlockchain = (chain: string): chain is BlockchainName => {
  return typeof chain === 'string' && /^[a-zA-Z0-9 _-]{1,30}$/.test(chain);
};

// Helper functions to create validated types
const createAddress = (address: string): SwapAddress => {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid address format: ${address}`);
  }
  return address as SwapAddress;
};

const createTokenSymbol = (symbol: string): SwapTokenSymbol => {
  if (!isValidTokenSymbol(symbol)) {
    throw new Error(`Invalid token symbol: ${symbol}`);
  }
  return symbol as SwapTokenSymbol;
};

const createAmount = (amount: string): SwapAmount => {
  if (!isValidAmount(amount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  return amount as SwapAmount;
};

const createBlockchain = (chain: string): BlockchainName => {
  if (!isValidBlockchain(chain)) {
    throw new Error(`Invalid blockchain identifier: ${chain}`);
  }
  return chain as BlockchainName;
};

// Parse individual swap info string (blockchain:amount:token:destination_address)
const parseSwapInfo = (swapString: string): SwapInfo => {
  const parts = swapString.split(':');
  
  if (parts.length !== 4) {
    throw new Error(`Invalid swap info format. Expected 4 parts, got ${parts.length}: ${swapString}`);
  }
  
  const [blockchain, amount, token, destinationAddress] = parts;
  
  // Validate blockchain
  const validatedBlockchain = createBlockchain(blockchain);
  
  // Validate amount
  const validatedAmount = createAmount(amount);
  
  // Validate destination address
  const validatedDestinationAddress = createAddress(destinationAddress);
  
  // Parse token (can be symbol or address)
  let tokenSymbol: SwapTokenSymbol | undefined;
  let tokenAddress: SwapAddress | undefined;
  
  if (isValidAddress(token)) {
    tokenAddress = createAddress(token);
  } else if (isValidTokenSymbol(token)) {
    tokenSymbol = createTokenSymbol(token);
  } else {
    throw new Error(`Invalid token format. Must be valid address or symbol: ${token}`);
  }
  
  return {
    blockchain: validatedBlockchain,
    amount: validatedAmount,
    token: {
      symbol: tokenSymbol,
      address: tokenAddress
    },
    destinationAddress: validatedDestinationAddress
  };
};

// Main function to parse URL query parameters
const parseSwapParams = (queryParams: URLSearchParams): SwapParams => {
  const dstParams = queryParams.getAll('dst');
  
  if (dstParams.length === 0) {
    throw new Error('Missing required parameter: dst');
  }
  
  try {
    const dst = dstParams.map(parseSwapInfo);
    const srcParam = queryParams.get('src');
    const src = srcParam ? parseSwapInfo(srcParam) : undefined;
    
    return {
      dst,
      src
    };
  } catch (error) {
    throw new Error(`Failed to parse swap parameters: ${(error as Error).message}`);
  }
};

// Alternative: Function that returns validation result instead of throwing
const parseSwapParamsSafe = (queryParams: URLSearchParams): { 
  success: boolean; 
  data?: SwapParams; 
  error?: string 
} => {
  try {
    const data = parseSwapParams(queryParams);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export {
  parseSwapParams,
  parseSwapParamsSafe,
  createAddress,
  createTokenSymbol,
  createAmount,
  createBlockchain
};
