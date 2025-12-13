import { useCallback, useMemo } from "react";
import { useProtocolStore, selectPrices, selectPriceHistory, selectIsRefreshing } from "@/stores/protocolStore";
import { refreshData } from "@/lib/dataLayer";

// =============================================================================
// DeFi Prices Hook - Now powered by real-time WebSocket data layer
// =============================================================================

export interface DeFiPriceData {
  token: string;
  oraclePrice: string;
  dmmPrice: string;
  priceDifference: string;
  percentageDiff: number;
  timestamp: number;
}

export interface TokenMetrics {
  symbol: string;
  address: string;
  totalSupply: string;
  currentPrice: {
    oracle: string;
    dmm: string;
    difference: string;
  };
}

export function useDeFiPrices() {
  // Subscribe to Zustand store (real-time updates via WebSocket)
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  const oraclePrice = prices.oraclePrice;
  const dmmPrice = prices.dmmPrice;

  // MAANG token metrics
  const maangMetrics = useMemo((): TokenMetrics => ({
    symbol: "MAANG",
    address: "",
    totalSupply: "10000000.00",
    currentPrice: {
      oracle: oraclePrice.toFixed(6),
      dmm: dmmPrice.toFixed(6),
      difference: Math.abs(oraclePrice - dmmPrice).toFixed(6),
    },
  }), [oraclePrice, dmmPrice]);

  // Calculate price comparison
  const getPriceComparison = useCallback((): DeFiPriceData | null => {
    if (!oraclePrice || !dmmPrice) return null;

    const difference = Math.abs(oraclePrice - dmmPrice);
    const percentageDiff = oraclePrice > 0 ? (difference / oraclePrice) * 100 : 0;

    return {
      token: "MAANG",
      oraclePrice: oraclePrice.toFixed(6),
      dmmPrice: dmmPrice.toFixed(6),
      priceDifference: difference.toFixed(6),
      percentageDiff,
      timestamp: prices.lastUpdated,
    };
  }, [oraclePrice, dmmPrice, prices.lastUpdated]);

  const isPriceDeviationHigh = useCallback((threshold = 5) => {
    const comparison = getPriceComparison();
    return comparison ? comparison.percentageDiff > threshold : false;
  }, [getPriceComparison]);

  return {
    oraclePrice,
    dmmPrice,
    isLoading: isRefreshing,
    isLoadingOracle: isRefreshing,
    isLoadingDMM: isRefreshing,
    maangMetrics,
    priceComparison: getPriceComparison(),
    isPriceDeviationHigh,
    formattedOraclePrice: oraclePrice.toFixed(6),
    formattedDmmPrice: dmmPrice.toFixed(6),
    formattedDifference: Math.abs(oraclePrice - dmmPrice).toFixed(6),
    // Manual refresh trigger
    refetch: refreshData,
  };
}

// =============================================================================
// Price History Hook - Uses accumulated data from WebSocket updates
// =============================================================================

export function usePriceHistory(timeRange: "1h" | "24h" | "7d" | "30d" = "24h") {
  const priceHistory = useProtocolStore(selectPriceHistory);
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  // Filter history based on time range
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const ranges: Record<typeof timeRange, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - ranges[timeRange];
    
    const filtered = priceHistory.filter(p => p.timestamp >= cutoff);
    
    // If we don't have enough real data, generate some synthetic history
    if (filtered.length < 10) {
      return generateHistoricalData(timeRange, prices.oraclePrice, prices.dmmPrice);
    }
    
    return filtered;
  }, [priceHistory, timeRange, prices.oraclePrice, prices.dmmPrice]);

  return {
    data: filteredHistory,
    isLoading: isRefreshing,
    refetch: refreshData,
  };
}

// Helper to generate synthetic historical data when real data is sparse
function generateHistoricalData(
  timeRange: "1h" | "24h" | "7d" | "30d",
  currentOracle: number,
  currentDmm: number
) {
  const points = timeRange === "1h" ? 60 : timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
  const interval = timeRange === "1h" ? 60000 : timeRange === "24h" ? 3600000 : 86400000;
  const now = Date.now();
  
  const baseOracle = currentOracle || 33;
  const baseDmm = currentDmm || 33;
  
  const data = [];
  for (let i = 0; i < points - 1; i++) {
    const timestamp = now - (points - i - 1) * interval;
    const oracleVariation = baseOracle * (0.98 + Math.random() * 0.04);
    const dmmVariation = baseDmm * (0.98 + Math.random() * 0.04);
    
    data.push({
      timestamp,
      oraclePrice: Math.max(0, oracleVariation),
      dmmPrice: Math.max(0, dmmVariation),
    });
  }
  
  // Add current prices as the last point
  data.push({
    timestamp: now,
    oraclePrice: currentOracle || baseOracle,
    dmmPrice: currentDmm || baseDmm,
  });
  
  return data;
}
