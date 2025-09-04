import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/thirdweb";
import { getContract, readContract } from "thirdweb";
import { CONTRACTS, ORACLE_ABI, DMM_ABI, getContractConfig } from "@/config/contracts";
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
  // Oracle price fetching
  const { data: oraclePrice, isLoading: isLoadingOracle } = useQuery({
    queryKey: ["oracle-price"],
    refetchInterval: 30_000, // Update every 30 seconds
    queryFn: async () => {
      try {
        const oracleContract = getContract({
          client,
          ...getContractConfig("ORACLE"),
          abi: ORACLE_ABI,
        });

        const price = await readContract({
          contract: oracleContract,
          method: "getLatestPrice",
          params: [],
        });

        // Convert from wei to readable format (assuming 18 decimals)
        return Number(price) / 10 ** 18;
      } catch (error) {
        console.warn("Oracle contract not available (expected during development):", error.message || error);
        return 0;
      }
    },
  });

  // DMM price fetching
  const { data: dmmPrice, isLoading: isLoadingDMM } = useQuery({
    queryKey: ["dmm-price", CONTRACTS.DYNAMIC_MARKET_MAKER],
    refetchInterval: 30_000,
    queryFn: async () => {
      try {
        const dmmContract = getContract({
          client,
          ...getContractConfig("DYNAMIC_MARKET_MAKER"),
          abi: DMM_ABI,
        });

        const price = await readContract({
          contract: dmmContract,
          method: "getCurrentPrice",
          params: [],
        });

        // Convert from wei to readable format
        return Number(price) / 10 ** 18;
      } catch (error) {
        console.warn("DMM contract not available (expected during development):", error.message || error);
        return 0;
      }
    },
  });

  // MAANG token metrics
  const { data: maangMetrics, isLoading: isLoadingMaang } = useQuery({
    queryKey: ["maang-metrics"],
    refetchInterval: 30_000,
    queryFn: async () => {
      try {
        const maangContract = getContract({
          client,
          ...getContractConfig("DYNAMIC_MARKET_MAKER"),
          abi: DMM_ABI,
        });

        const totalSupply = await readContract({
          contract: maangContract,
          method: "totalSupply",
          params: [],
        });

        return {
          symbol: "MAANG",
          address: CONTRACTS.DYNAMIC_MARKET_MAKER,
          totalSupply: (Number(totalSupply) / 10 ** 18).toFixed(2),
          currentPrice: {
            oracle: oraclePrice?.toFixed(6) || "0.000000",
            dmm: dmmPrice?.toFixed(6) || "0.000000",
            difference: Math.abs((oraclePrice || 0) - (dmmPrice || 0)).toFixed(6),
          },
        } as TokenMetrics;
      } catch (error) {
        console.error("Failed to fetch MAANG metrics:", error);
        return null;
      }
    },
    enabled: !!oraclePrice && !!dmmPrice, // Only run when we have both prices
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
    // Individual prices
    oraclePrice: oraclePrice || 0,
    dmmPrice: dmmPrice || 0,
    
    // Loading states
    isLoading: isLoadingOracle || isLoadingDMM || isLoadingMaang,
    isLoadingOracle,
    isLoadingDMM,
    
    // Token metrics
    maangMetrics,
    
    // Price comparison utilities
    priceComparison: getPriceComparison(),
    isPriceDeviationHigh,
    
    // Formatted values
    formattedOraclePrice: oraclePrice?.toFixed(6) || "0.000000",
    formattedDmmPrice: dmmPrice?.toFixed(6) || "0.000000",
    formattedDifference: Math.abs((oraclePrice || 0) - (dmmPrice || 0)).toFixed(6),
  };
}

// Hook for historical price data with live Oracle/DMM integration
export function usePriceHistory(timeRange: "1h" | "24h" | "7d" | "30d" = "24h") {
  const { oraclePrice, dmmPrice } = useDeFiPrices();
  
  return useQuery({
    queryKey: ["price-history", timeRange, oraclePrice, dmmPrice],
    refetchInterval: 60_000, // Update every minute
    queryFn: async () => {
      try {
        // For now, we simulate historical data but use current Oracle/DMM prices as the latest point
        // In a production environment, you would fetch this from your backend or blockchain events
        
        const generateHistoricalData = (points: number) => {
          const now = Date.now();
          const interval = timeRange === "1h" ? 60000 : timeRange === "24h" ? 3600000 : 86400000;
          
          // Create historical points leading up to current prices
          const data = [];
          for (let i = 0; i < points - 1; i++) {
            const timestamp = now - (points - i - 1) * interval;
            
            // Simulate price variation around current values
            const oracleVariation = (oraclePrice || 2.3) * (0.95 + Math.random() * 0.1);
            const dmmVariation = (dmmPrice || 2.3) * (0.95 + Math.random() * 0.1);
            
            data.push({
              timestamp,
              oraclePrice: Math.max(0, oracleVariation),
              dmmPrice: Math.max(0, dmmVariation),
            });
          }
          
          // Add current live prices as the latest point
          data.push({
            timestamp: now,
            oraclePrice: oraclePrice || 0,
            dmmPrice: dmmPrice || 0,
          });
          
          return data;
        };

        const points = timeRange === "1h" ? 60 : timeRange === "24h" ? 24 : timeRange === "7d" ? 168 : 720;
        return generateHistoricalData(points);
      } catch (error) {
        console.error("Price history fetch error:", error);
        
        // Fallback to basic mock data
        const points = timeRange === "1h" ? 60 : timeRange === "24h" ? 24 : 30;
        const now = Date.now();
        const interval = timeRange === "1h" ? 60000 : timeRange === "24h" ? 3600000 : 86400000;
        
        return Array.from({ length: points }, (_, i) => ({
          timestamp: now - (points - i - 1) * interval,
          oraclePrice: 0,
          dmmPrice: 0,
        }));
      }
    },
  });
}
