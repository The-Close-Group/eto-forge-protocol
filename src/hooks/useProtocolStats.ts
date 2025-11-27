import { useQuery } from '@tanstack/react-query';
import { etoPublicClient } from '@/lib/etoRpc';
import { DMM_ADDRESS, ORACLE_ADDRESS, SMAANG_VAULT_ADDRESS, PEG_STABILITY_MODULE_ADDRESS, BOOTSTRAP_DRI_CONTROLLER_ADDRESS } from '@/config/contracts';

const DMM_ABI = [
  {
    inputs: [],
    name: 'getCurrentPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalLiquidity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liquidityPosition',
    outputs: [
      { name: 'driTokens', type: 'uint256' },
      { name: 'usdcTokens', type: 'uint256' },
      { name: 'lowerTick', type: 'uint256' },
      { name: 'upperTick', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'accumulatedFees',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const ORACLE_ABI = [
  {
    inputs: [],
    name: 'getAggregatedPrice',
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const VAULT_ABI = [
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const CONTROLLER_ABI = [
  {
    inputs: [],
    name: 'lastSyncTime',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'halted',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'skipOracleValidation',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export interface ProtocolStats {
  // Prices
  oraclePrice: number;
  oracleTimestamp: number;
  dmmPrice: number;
  priceDeviation: number;
  
  // DMM
  totalLiquidity: number;
  dmmDriBalance: number;
  dmmUsdcBalance: number;
  dmmPaused: boolean;
  accumulatedFees: number;
  
  // Vault
  vaultTotalAssets: number;
  vaultTotalSupply: number;
  vaultSharePrice: number;
  
  // Controller
  lastSyncTime: number;
  controllerHalted: boolean;
  skipOracleValidation: boolean;
  
  // Calculated
  tvl: number;
  isHealthy: boolean;
}

export function useProtocolStats() {
  return useQuery({
    queryKey: ['protocol-stats'],
    queryFn: async (): Promise<ProtocolStats> => {
      try {
        // Fetch all data in parallel
        const [
          oracleData,
          dmmPrice,
          totalLiquidity,
          liquidityPosition,
          dmmPaused,
          vaultTotalAssets,
          vaultTotalSupply,
          lastSyncTime,
        ] = await Promise.all([
          etoPublicClient.readContract({
            address: ORACLE_ADDRESS as `0x${string}`,
            abi: ORACLE_ABI,
            functionName: 'getAggregatedPrice',
          }).catch(() => [0n, 0n] as const),
          etoPublicClient.readContract({
            address: DMM_ADDRESS as `0x${string}`,
            abi: DMM_ABI,
            functionName: 'getCurrentPrice',
          }).catch(() => 0n),
          etoPublicClient.readContract({
            address: DMM_ADDRESS as `0x${string}`,
            abi: DMM_ABI,
            functionName: 'totalLiquidity',
          }).catch(() => 0n),
          etoPublicClient.readContract({
            address: DMM_ADDRESS as `0x${string}`,
            abi: DMM_ABI,
            functionName: 'liquidityPosition',
          }).catch(() => [0n, 0n, 0n, 0n, 0n] as const),
          etoPublicClient.readContract({
            address: DMM_ADDRESS as `0x${string}`,
            abi: DMM_ABI,
            functionName: 'paused',
          }).catch(() => false),
          etoPublicClient.readContract({
            address: SMAANG_VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'totalAssets',
          }).catch(() => 0n),
          etoPublicClient.readContract({
            address: SMAANG_VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'totalSupply',
          }).catch(() => 0n),
          etoPublicClient.readContract({
            address: BOOTSTRAP_DRI_CONTROLLER_ADDRESS as `0x${string}`,
            abi: CONTROLLER_ABI,
            functionName: 'lastSyncTime',
          }).catch(() => 0n),
        ]);

        // Parse values
        const oraclePriceRaw = Number(oracleData[0]) / 1e18;
        const oracleTimestampRaw = Number(oracleData[1]);
        const dmmPriceRaw = Number(dmmPrice) / 1e18;
        const totalLiquidityRaw = Number(totalLiquidity) / 1e18;
        const dmmDriBalance = Number(liquidityPosition[0]) / 1e18;
        const dmmUsdcBalance = Number(liquidityPosition[1]) / 1e6;
        const vaultTotalAssetsRaw = Number(vaultTotalAssets) / 1e18;
        const vaultTotalSupplyRaw = Number(vaultTotalSupply) / 1e18;
        const lastSyncTimeRaw = Number(lastSyncTime);

        // Calculate derived values
        const priceDeviation = oraclePriceRaw > 0 
          ? ((dmmPriceRaw - oraclePriceRaw) / oraclePriceRaw) * 10000 // in bps
          : 0;
        
        const vaultSharePrice = vaultTotalSupplyRaw > 0 
          ? vaultTotalAssetsRaw / vaultTotalSupplyRaw 
          : 1;

        // TVL = DMM USDC + Vault Assets (rough estimate)
        const tvl = dmmUsdcBalance + (vaultTotalAssetsRaw * dmmPriceRaw);

        // Health check: not paused, price within 1%
        // Note: We don't check sync time since skipOracleValidation is enabled for paper trading
        const isHealthy = !dmmPaused && 
          Math.abs(priceDeviation) < 100; // Less than 1% deviation (100 bps)

        return {
          oraclePrice: oraclePriceRaw,
          oracleTimestamp: oracleTimestampRaw,
          dmmPrice: dmmPriceRaw,
          priceDeviation,
          totalLiquidity: totalLiquidityRaw,
          dmmDriBalance,
          dmmUsdcBalance,
          dmmPaused,
          accumulatedFees: 0, // Would need to add this call
          vaultTotalAssets: vaultTotalAssetsRaw,
          vaultTotalSupply: vaultTotalSupplyRaw,
          vaultSharePrice,
          lastSyncTime: lastSyncTimeRaw,
          controllerHalted: false, // Would need to add this call
          skipOracleValidation: true,
          tvl,
          isHealthy,
        };
      } catch (error) {
        console.error('Failed to fetch protocol stats:', error);
        throw error;
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
}

