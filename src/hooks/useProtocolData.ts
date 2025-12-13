import { useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import {
  useProtocolStore,
  selectPrices,
  selectStats,
  selectActivities,
  selectLatestBlock,
  selectConnection,
  selectIsConnected,
  selectIsInitializing,
  selectIsRefreshing,
  selectPriceHistory,
  selectOraclePrice,
  selectDmmPrice,
  selectTvl,
  selectIsHealthy,
  selectBalances,
} from '@/stores/protocolStore';
import {
  initializeDataLayer,
  destroyDataLayer,
  setUserAddress,
  refreshData,
} from '@/lib/dataLayer';

// =============================================================================
// Main Protocol Data Hook - Initialize the data layer
// =============================================================================

export function useProtocolDataProvider() {
  const account = useActiveAccount();

  useEffect(() => {
    // Initialize WebSocket + multicall on mount
    initializeDataLayer();

    return () => {
      destroyDataLayer();
    };
  }, []);

  // Update user address when wallet changes
  useEffect(() => {
    setUserAddress(account?.address ?? null);
  }, [account?.address]);

  return null;
}

// =============================================================================
// Granular Hooks - Subscribe to specific slices of state
// =============================================================================

/**
 * Get all price data (Oracle, DMM, deviation)
 */
export function usePriceData() {
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    oraclePrice: prices.oraclePrice,
    dmmPrice: prices.dmmPrice,
    priceDeviation: prices.priceDeviation,
    oracleTimestamp: prices.oracleTimestamp,
    lastUpdated: prices.lastUpdated,
    isLoading: isRefreshing,
  };
}

/**
 * Get just Oracle price (minimal re-renders)
 */
export function useOraclePrice() {
  return useProtocolStore(selectOraclePrice);
}

/**
 * Get just DMM price (minimal re-renders)
 */
export function useDmmPrice() {
  return useProtocolStore(selectDmmPrice);
}

/**
 * Get protocol statistics (TVL, liquidity, vault data)
 */
export function useProtocolStatsData() {
  const stats = useProtocolStore(selectStats);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    ...stats,
    isLoading: isRefreshing,
  };
}

/**
 * Get TVL only
 */
export function useTvl() {
  return useProtocolStore(selectTvl);
}

/**
 * Get protocol health status
 */
export function useProtocolHealth() {
  return useProtocolStore(selectIsHealthy);
}

/**
 * Get user balances for a specific address
 */
export function useUserBalances(address?: string) {
  const account = useActiveAccount();
  const walletAddress = address || account?.address || '';
  const balances = useProtocolStore(selectBalances(walletAddress));
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    balances,
    isLoading: isRefreshing,
    address: walletAddress,
  };
}

/**
 * Get protocol activity feed
 */
export function useActivityFeed() {
  const activities = useProtocolStore(selectActivities);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    activities,
    isLoading: isRefreshing,
  };
}

/**
 * Get latest block info
 */
export function useLatestBlock() {
  return useProtocolStore(selectLatestBlock);
}

/**
 * Get price history for charts
 */
export function usePriceHistoryData() {
  const history = useProtocolStore(selectPriceHistory);
  const prices = useProtocolStore(selectPrices);

  return {
    history,
    currentOraclePrice: prices.oraclePrice,
    currentDmmPrice: prices.dmmPrice,
  };
}

/**
 * Get connection status
 */
export function useConnectionStatus() {
  const connection = useProtocolStore(selectConnection);
  const isConnected = useProtocolStore(selectIsConnected);
  const isInitializing = useProtocolStore(selectIsInitializing);

  return {
    ...connection,
    isConnected,
    isInitializing,
  };
}

/**
 * Manual refresh trigger
 */
export function useRefresh() {
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  const refresh = useCallback(async () => {
    await refreshData();
  }, []);

  return {
    refresh,
    isRefreshing,
  };
}

// =============================================================================
// Combined Hook - For components that need everything
// =============================================================================

export function useAllProtocolData() {
  const prices = useProtocolStore(selectPrices);
  const stats = useProtocolStore(selectStats);
  const activities = useProtocolStore(selectActivities);
  const latestBlock = useProtocolStore(selectLatestBlock);
  const connection = useProtocolStore(selectConnection);
  const isInitializing = useProtocolStore(selectIsInitializing);
  const isRefreshing = useProtocolStore(selectIsRefreshing);
  const priceHistory = useProtocolStore(selectPriceHistory);

  const account = useActiveAccount();
  const balances = useProtocolStore(selectBalances(account?.address || ''));

  return {
    prices,
    stats,
    activities,
    latestBlock,
    connection,
    balances,
    priceHistory,
    isInitializing,
    isRefreshing,
    refresh: refreshData,
  };
}

// =============================================================================
// Compatibility Hooks - Bridge to existing code
// =============================================================================

/**
 * Drop-in replacement for useDeFiPrices
 */
export function useRealTimePrices() {
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    oraclePrice: prices.oraclePrice,
    dmmPrice: prices.dmmPrice,
    isLoading: isRefreshing,
    isLoadingOracle: isRefreshing,
    isLoadingDMM: isRefreshing,
    maangMetrics: {
      symbol: 'MAANG',
      address: '',
      totalSupply: '10000000.00',
      currentPrice: {
        oracle: prices.oraclePrice.toFixed(6),
        dmm: prices.dmmPrice.toFixed(6),
        difference: Math.abs(prices.oraclePrice - prices.dmmPrice).toFixed(6),
      },
    },
    priceComparison: {
      token: 'MAANG',
      oraclePrice: prices.oraclePrice.toFixed(6),
      dmmPrice: prices.dmmPrice.toFixed(6),
      priceDifference: Math.abs(prices.oraclePrice - prices.dmmPrice).toFixed(6),
      percentageDiff: prices.oraclePrice > 0 
        ? (Math.abs(prices.oraclePrice - prices.dmmPrice) / prices.oraclePrice) * 100 
        : 0,
      timestamp: prices.lastUpdated,
    },
    isPriceDeviationHigh: (threshold = 5) => {
      const diff = prices.oraclePrice > 0 
        ? (Math.abs(prices.oraclePrice - prices.dmmPrice) / prices.oraclePrice) * 100 
        : 0;
      return diff > threshold;
    },
    formattedOraclePrice: prices.oraclePrice.toFixed(6),
    formattedDmmPrice: prices.dmmPrice.toFixed(6),
    formattedDifference: Math.abs(prices.oraclePrice - prices.dmmPrice).toFixed(6),
  };
}

/**
 * Drop-in replacement for useProtocolStats
 */
export function useRealTimeProtocolStats() {
  const stats = useProtocolStore(selectStats);
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    data: {
      oraclePrice: prices.oraclePrice,
      oracleTimestamp: prices.oracleTimestamp,
      dmmPrice: prices.dmmPrice,
      priceDeviation: prices.priceDeviation,
      ...stats,
      lastSyncTime: 0,
      controllerHalted: false,
      skipOracleValidation: true,
      accumulatedFees: 0,
    },
    isLoading: isRefreshing,
    refetch: refreshData,
  };
}

/**
 * Drop-in replacement for useProtocolActivity
 */
export function useRealTimeProtocolActivity() {
  const activities = useProtocolStore(selectActivities);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  return {
    data: activities,
    isLoading: isRefreshing,
    refetch: refreshData,
  };
}

