import { useCallback, useMemo } from "react";
import { useProtocolStore, selectPrices, selectIsRefreshing } from "@/stores/protocolStore";
import { getTokensWithCoingeckoId } from "@/config/tokens";
import { refreshData } from "@/lib/dataLayer";

// =============================================================================
// Enhanced Prices Hook - Now powered by real-time WebSocket data layer
// =============================================================================

export interface EnhancedPriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change?: number;
    last_updated_at?: number;
    source: 'coingecko' | 'oracle' | 'dmm' | 'fallback';
  };
}

// Fallback prices for tokens without live price feeds
const FALLBACK_PRICES: Record<string, number> = {
  mUSDC: 1.0,
  GOVDRI: 0.0,
  MAANG: 33.0,
  ETH: 3567.00,
  WETH: 3567.00,
  USDC: 1.00,
  AVAX: 26.00,
  BTC: 45000.00,
  MATIC: 0.75,
  ARB: 0.90,
  OP: 1.85,
};

export function useEnhancedPrices() {
  // Subscribe to Zustand store (real-time updates via WebSocket)
  const prices = useProtocolStore(selectPrices);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  const oraclePrice = prices.oraclePrice;
  const dmmPrice = prices.dmmPrice;

  // Build price data from store + fallbacks
  const priceData = useMemo((): EnhancedPriceData => {
    const data: EnhancedPriceData = {};
    
    // Add MAANG price from Oracle (preferred) or DMM
    if (oraclePrice > 0) {
      data['MAANG'] = {
        usd: oraclePrice,
        usd_24h_change: 0,
        last_updated_at: prices.lastUpdated / 1000,
        source: 'oracle',
      };
    } else if (dmmPrice > 0) {
      data['MAANG'] = {
        usd: dmmPrice,
        usd_24h_change: 0,
        last_updated_at: prices.lastUpdated / 1000,
        source: 'dmm',
      };
    }

    // Add fallback prices for all other tokens
    Object.entries(FALLBACK_PRICES).forEach(([symbol, price]) => {
      if (!data[symbol]) {
        data[symbol] = {
          usd: price,
          usd_24h_change: 0,
          last_updated_at: Date.now() / 1000,
          source: 'fallback',
        };
      }
    });

    return data;
  }, [oraclePrice, dmmPrice, prices.lastUpdated]);

  const getTokenPrice = useCallback((symbol: string): number => {
    const tokenData = priceData[symbol];
    if (tokenData) {
      return tokenData.usd;
    }
    return FALLBACK_PRICES[symbol] || 0;
  }, [priceData]);

  const getTokenChange24h = useCallback((symbol: string): number => {
    return priceData[symbol]?.usd_24h_change || 0;
  }, [priceData]);

  const getTokenSource = useCallback((symbol: string): string => {
    return priceData[symbol]?.source || 'unknown';
  }, [priceData]);

  const getTokenPrices = useCallback((symbols: string[]): Record<string, number> => {
    const result: Record<string, number> = {};
    symbols.forEach(symbol => {
      result[symbol] = getTokenPrice(symbol);
    });
    return result;
  }, [getTokenPrice]);

  return {
    prices: priceData,
    isLoading: isRefreshing,
    error: null,
    refetch: refreshData,
    getTokenPrice,
    getTokenChange24h,
    getTokenSource,
    getTokenPrices,
    
    // DeFi-specific data
    oraclePrice,
    dmmPrice,
    isDeFiLoading: isRefreshing,
  };
}
