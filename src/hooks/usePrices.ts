import { useEnhancedPrices } from "@/hooks/useEnhancedPrices";

export interface PriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

// Re-export enhanced pricing as the main pricing hook
export function usePrices() {
  return useEnhancedPrices();
}