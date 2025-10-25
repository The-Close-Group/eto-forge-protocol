import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { getTokensWithCoingeckoId, getTokenBySymbol } from "@/config/tokens";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";

export interface EnhancedPriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change?: number;
    last_updated_at?: number;
    source: 'coingecko' | 'oracle' | 'dmm' | 'fallback';
  };
}

// Fallback prices for tokens without CoinGecko IDs
const FALLBACK_PRICES: Record<string, number> = {
  mUSDC: 1.0, // Mock USDC pegged to USD - exactly 1:1
  GOVDRI: 0.0, // No USD value - governance token
  MAANG: 33.0, // Meta AI & Analytics Token
  
  // Common token fallbacks (used when CoinGecko is unavailable)
  ETH: 3567.00,
  WETH: 3567.00,
  USDC: 1.00,
  AVAX: 26.00,
  BTC: 45000.00,
  MATIC: 0.75,
  ARB: 0.90,
  OP: 1.85,
};

// CoinGecko API configuration
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const PRICE_UPDATE_INTERVAL = 30_000; // 30 seconds

/**
 * Enhanced pricing hook that combines CoinGecko, Oracle, and DMM pricing
 */
export function useEnhancedPrices() {
  // Get DeFi prices from Oracle and DMM
  const {
    oraclePrice,
    dmmPrice,
    isLoading: isDeFiLoading
  } = useDeFiPrices();

  const { data: prices, isLoading: isCoinGeckoLoading, error, refetch } = useQuery<EnhancedPriceData>({
    queryKey: ["enhanced-token-prices", oraclePrice, dmmPrice],
    refetchInterval: PRICE_UPDATE_INTERVAL,
    staleTime: 20_000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const priceData: EnhancedPriceData = {};

        // 1. Fetch CoinGecko prices for supported tokens
        const tokensWithIds = getTokensWithCoingeckoId();
        const coingeckoIds = tokensWithIds
          .map(token => token.coingeckoId)
          .filter(Boolean)
          .join(',');

        // Skip CoinGecko for now due to CORS issues in development
        // TODO: In production, implement proper proxy or server-side fetch
        console.log("Skipping CoinGecko API due to CORS restrictions - using fallback prices");

        // 1.5. Add fallback prices for common tokens that would normally come from CoinGecko
        tokensWithIds.forEach(token => {
          if (token.coingeckoId && FALLBACK_PRICES[token.symbol]) {
            priceData[token.symbol] = {
              usd: FALLBACK_PRICES[token.symbol],
              usd_24h_change: 0,
              last_updated_at: Date.now() / 1000,
              source: 'fallback',
            };
          }
        });

        // 2. Add Oracle price for MAANG (prioritize Oracle over DMM, then fallback)
        if (oraclePrice > 0) {
          priceData['MAANG'] = {
            usd: oraclePrice,
            usd_24h_change: 0, // TODO: Calculate from historical data
            last_updated_at: Date.now() / 1000,
            source: 'oracle',
          };
        } else if (dmmPrice > 0) {
          // Fallback to DMM if Oracle fails
          priceData['MAANG'] = {
            usd: dmmPrice,
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000,
            source: 'dmm',
          };
        } else if (FALLBACK_PRICES['MAANG']) {
          // Use static fallback price if Oracle/DMM unavailable
          priceData['MAANG'] = {
            usd: FALLBACK_PRICES['MAANG'],
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000,
            source: 'fallback',
          };
        }

        // 3. DRI token price - only show if we have Oracle/DMM data
        // No fallback price - will only show if fetched from contracts

        // 4. Add fallback prices for other tokens (mUSDC must always be $1.00)
        Object.entries(FALLBACK_PRICES).forEach(([symbol, price]) => {
          priceData[symbol] = {
            usd: price,
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000,
            source: 'fallback',
          };
        });

        return priceData;
      } catch (error) {
        console.error("Enhanced pricing error:", error);
        
        // Return basic fallback data
        const fallbackData: EnhancedPriceData = {};
        Object.entries(FALLBACK_PRICES).forEach(([symbol, price]) => {
          fallbackData[symbol] = {
            usd: price,
            usd_24h_change: 0,
            last_updated_at: Date.now() / 1000,
            source: 'fallback',
          };
        });
        
        return fallbackData;
      }
    },
  });

  const isLoading = isCoinGeckoLoading || isDeFiLoading;

  const getTokenPrice = useCallback((symbol: string): number => {
    const tokenData = prices?.[symbol];
    if (tokenData) {
      return tokenData.usd;
    }
    
    // Final fallback
    return FALLBACK_PRICES[symbol] || 0;
  }, [prices]);

  const getTokenChange24h = useCallback((symbol: string): number => {
    return prices?.[symbol]?.usd_24h_change || 0;
  }, [prices]);

  const getTokenSource = useCallback((symbol: string): string => {
    return prices?.[symbol]?.source || 'unknown';
  }, [prices]);

  const getTokenPrices = useCallback((symbols: string[]): Record<string, number> => {
    const result: Record<string, number> = {};
    symbols.forEach(symbol => {
      result[symbol] = getTokenPrice(symbol);
    });
    return result;
  }, [getTokenPrice]);

  return {
    prices,
    isLoading,
    error,
    refetch,
    getTokenPrice,
    getTokenChange24h,
    getTokenSource,
    getTokenPrices,
    
    // DeFi-specific data
    oraclePrice,
    dmmPrice,
    isDeFiLoading,
  };
}
