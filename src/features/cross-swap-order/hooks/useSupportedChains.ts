import { useQuery } from '@tanstack/react-query';
import { TokenService } from '../../../services/token-service';
import { blockchainData, type BlockchainData } from '../../../data/blockchains';

const tokenService = new TokenService();
export const useSupportedChains = () => {
  return useQuery<BlockchainData[]>({
    queryKey: ['supportedChains'],
    queryFn: async () => {
      const chainIds = await tokenService.getSupportedChains();
      // Map blockchainData based on chainIds
      // This mapping logic needs implementation
      const chains = blockchainData.filter(c => chainIds.find(id => c.chainId == id || c.networkId == id));
      console.log("returning chains", chains);
      return chains;
    },
    staleTime: Infinity,
  });
};
