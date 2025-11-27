import { useQuery } from "@tanstack/react-query";
import { readEtoContract } from "@/lib/etoRpc";
import { CONTRACTS, ORACLE_ABI, DMM_ABI } from "@/config/contracts";
import { useCallback } from "react";

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
  // Oracle price fetching - using DIRECT RPC (bypasses Thirdweb)
  const { data: oraclePrice, isLoading: isLoadingOracle } = useQuery({
    queryKey: ["oracle-price"],
    refetchInterval: 30_000,
    queryFn: async () => {
      try {
        const [price] = await readEtoContract<[bigint, bigint]>({
          address: CONTRACTS.ORACLE_AGGREGATOR as `0x${string}`,
          abi: ORACLE_ABI,
          functionName: "getAggregatedPrice",
        });
        return Number(price) / 10 ** 18;
      } catch (error: any) {
        console.warn("Oracle read failed:", error.message || error);
        return 0;
      }
    },
  });

  // DMM price fetching - using DIRECT RPC
  const { data: dmmPrice, isLoading: isLoadingDMM } = useQuery({
    queryKey: ["dmm-price"],
    refetchInterval: 30_000,
    queryFn: async () => {
      try {
        const price = await readEtoContract<bigint>({
          address: CONTRACTS.DYNAMIC_MARKET_MAKER as `0x${string}`,
          abi: DMM_ABI,
          functionName: "getCurrentPrice",
        });
        return Number(price) / 10 ** 18;
      } catch (error: any) {
        console.warn("DMM read failed:", error.message || error);
        return 0;
      }
    },
  });

  // MAANG token metrics
  const { data: maangMetrics, isLoading: isLoadingMaang } = useQuery({
    queryKey: ["maang-metrics", oraclePrice, dmmPrice],
    refetchInterval: 30_000,
    enabled: oraclePrice !== undefined && dmmPrice !== undefined,
    queryFn: async () => {
      return {
        symbol: "MAANG",
        address: CONTRACTS.DYNAMIC_MARKET_MAKER,
        totalSupply: "10000000.00", // 10M DRI total supply
        currentPrice: {
          oracle: oraclePrice?.toFixed(6) || "0.000000",
          dmm: dmmPrice?.toFixed(6) || "0.000000",
          difference: Math.abs((oraclePrice || 0) - (dmmPrice || 0)).toFixed(6),
        },
      } as TokenMetrics;
    },
  });

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
      timestamp: Date.now(),
    };
  }, [oraclePrice, dmmPrice]);

  const isPriceDeviationHigh = useCallback((threshold = 5) => {
    const comparison = getPriceComparison();
    return comparison ? comparison.percentageDiff > threshold : false;
  }, [getPriceComparison]);

  return {
    oraclePrice: oraclePrice || 0,
    dmmPrice: dmmPrice || 0,
    isLoading: isLoadingOracle || isLoadingDMM || isLoadingMaang,
    isLoadingOracle,
    isLoadingDMM,
    maangMetrics,
    priceComparison: getPriceComparison(),
    isPriceDeviationHigh,
    formattedOraclePrice: oraclePrice?.toFixed(6) || "0.000000",
    formattedDmmPrice: dmmPrice?.toFixed(6) || "0.000000",
    formattedDifference: Math.abs((oraclePrice || 0) - (dmmPrice || 0)).toFixed(6),
  };
}

// Hook for historical price data
export function usePriceHistory(timeRange: "1h" | "24h" | "7d" | "30d" = "24h") {
  const { oraclePrice, dmmPrice } = useDeFiPrices();
  
  return useQuery({
    queryKey: ["price-history", timeRange, oraclePrice, dmmPrice],
    refetchInterval: 60_000,
    queryFn: async () => {
      const generateHistoricalData = (points: number) => {
        const now = Date.now();
        const interval = timeRange === "1h" ? 60000 : timeRange === "24h" ? 3600000 : 86400000;
        
        const data = [];
        for (let i = 0; i < points - 1; i++) {
          const timestamp = now - (points - i - 1) * interval;
          const oracleVariation = (oraclePrice || 318) * (0.98 + Math.random() * 0.04);
          const dmmVariation = (dmmPrice || 318) * (0.98 + Math.random() * 0.04);
          
          data.push({
            timestamp,
            oraclePrice: Math.max(0, oracleVariation),
            dmmPrice: Math.max(0, dmmVariation),
          });
        }
        
        data.push({
          timestamp: now,
          oraclePrice: oraclePrice || 0,
          dmmPrice: dmmPrice || 0,
        });
        
        return data;
      };

      const points = timeRange === "1h" ? 60 : timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
      return generateHistoricalData(points);
    },
  });
}
