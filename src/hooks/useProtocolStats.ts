import { useProtocolStore, selectStats, selectPrices, selectIsRefreshing, selectLatestBlock } from '@/stores/protocolStore';
import { refreshData } from '@/lib/dataLayer';

// =============================================================================
// Protocol Stats Hook - Now powered by real-time WebSocket data layer
// =============================================================================

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
  
  // Block info
  lastBlock: number;
  currentEpoch: number;
}

export function useProtocolStats() {
  // Subscribe to Zustand store (real-time updates via WebSocket)
  const stats = useProtocolStore(selectStats);
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);
  const latestBlock = useProtocolStore(selectLatestBlock);

  // Calculate epoch (blocks per epoch = 43200 for ~12hr epochs at 1 block/sec)
  const BLOCKS_PER_EPOCH = 43200;
  const blockNumber = latestBlock ? Number(latestBlock.number) : 0;
  const currentEpoch = Math.floor(blockNumber / BLOCKS_PER_EPOCH);

  // Combine stats and prices into the expected format
  const data: ProtocolStats = {
    // Prices from price slice
    oraclePrice: prices.oraclePrice,
    oracleTimestamp: prices.oracleTimestamp,
    dmmPrice: prices.dmmPrice,
    priceDeviation: prices.priceDeviation,
    
    // Stats from stats slice
    totalLiquidity: stats.totalLiquidity,
    dmmDriBalance: stats.dmmDriBalance,
    dmmUsdcBalance: stats.dmmUsdcBalance,
    dmmPaused: stats.dmmPaused,
    accumulatedFees: 0, // Not currently tracked
    
    // Vault stats
    vaultTotalAssets: stats.vaultTotalAssets,
    vaultTotalSupply: stats.vaultTotalSupply,
    vaultSharePrice: stats.vaultSharePrice,
    
    // Controller stats (defaults for now)
    lastSyncTime: 0,
    controllerHalted: false,
    skipOracleValidation: true,
    
    // Calculated values
    tvl: stats.tvl,
    isHealthy: stats.isHealthy,
    
    // Block info
    lastBlock: blockNumber,
    currentEpoch,
  };

  return {
    data,
    isLoading: isRefreshing,
    refetch: refreshData,
  };
}
