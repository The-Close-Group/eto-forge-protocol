import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { UTCTimestamp } from "lightweight-charts";

// MAANG stocks with 20% allocation each
export const MAANG_STOCKS = {
  META: { symbol: "META", name: "Meta Platforms", weight: 0.2, color: "#0668E1" },
  AAPL: { symbol: "AAPL", name: "Apple Inc.", weight: 0.2, color: "#A2AAAD" },
  AMZN: { symbol: "AMZN", name: "Amazon.com", weight: 0.2, color: "#FF9900" },
  NVDA: { symbol: "NVDA", name: "NVIDIA Corp.", weight: 0.2, color: "#76B900" },
  GOOG: { symbol: "GOOG", name: "Alphabet Inc.", weight: 0.2, color: "#4285F4" },
} as const;

export type StockSymbol = keyof typeof MAANG_STOCKS;

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioData {
  totalValue: number;
  change24h: number;
  changePercent: number;
  stocks: Record<StockSymbol, StockQuote>;
  chartData: Array<{ time: UTCTimestamp; value: number; volume: number }>;
  candleData: CandleData[];
  yahooCandleData: CandleData[]; // Live candles from Yahoo Finance
  lastUpdated: number;
}

// Yahoo Finance API endpoints with CORS proxy for browser access
// In production, use your own backend proxy
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

// Use proxy in development, direct in production (when you have a backend)
const getYahooUrl = (symbol: string, params: string) => {
  const yahooUrl = `${YAHOO_BASE_URL}/${symbol}?${params}`;
  // Use CORS proxy in browser
  if (typeof window !== 'undefined') {
    return `${CORS_PROXY}${encodeURIComponent(yahooUrl)}`;
  }
  return yahooUrl;
};

// Base prices for MAANG stocks (approximate Q1 2025 values)
const BASE_PRICES: Record<StockSymbol, { price: number; volatility: number }> = {
  META: { price: 612.45, volatility: 0.018 },   // Meta Platforms
  AAPL: { price: 243.52, volatility: 0.012 },   // Apple
  AMZN: { price: 228.67, volatility: 0.015 },   // Amazon
  NVDA: { price: 147.82, volatility: 0.025 },   // NVIDIA (higher volatility)
  GOOG: { price: 198.34, volatility: 0.014 },   // Alphabet
};

// Simulated price cache with realistic intraday movements
const priceCache: Record<StockSymbol, { price: number; lastUpdate: number; dailyChange: number }> = {} as any;

// Initialize price cache with base prices + random daily movement
function initPriceCache() {
  const now = Date.now();
  (Object.keys(BASE_PRICES) as StockSymbol[]).forEach((symbol) => {
    if (!priceCache[symbol] || now - priceCache[symbol].lastUpdate > 60000) {
      const base = BASE_PRICES[symbol];
      // Random daily change between -2% and +3%
      const dailyChange = (Math.random() - 0.4) * 5;
      const currentPrice = base.price * (1 + dailyChange / 100);
      priceCache[symbol] = {
        price: currentPrice,
        lastUpdate: now,
        dailyChange,
      };
    }
  });
}

// Simulate realistic price tick
function getSimulatedQuote(symbol: StockSymbol): StockQuote {
  initPriceCache();
  
  const base = BASE_PRICES[symbol];
  const cached = priceCache[symbol];
  
  // Add small random tick movement (simulates real-time price changes)
  const tickChange = (Math.random() - 0.5) * base.volatility;
  const newPrice = cached.price * (1 + tickChange);
  
  // Update cache
  priceCache[symbol].price = newPrice;
  priceCache[symbol].lastUpdate = Date.now();
  
  const previousClose = base.price;
  const change = newPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  return {
    symbol,
    price: Math.round(newPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    high: Math.round(newPrice * 1.008 * 100) / 100,
    low: Math.round(newPrice * 0.992 * 100) / 100,
    open: Math.round(base.price * (1 + cached.dailyChange * 0.3 / 100) * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    timestamp: Date.now(),
  };
}

// Fetch single stock quote from Yahoo Finance
async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const url = getYahooUrl(symbol, 'interval=1d&range=1d');
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Yahoo Finance API error for ${symbol}, using simulation`);
      return getSimulatedQuote(symbol as StockSymbol);
    }
    
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    
    if (meta && meta.regularMarketPrice) {
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
        symbol,
        price: currentPrice,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        high: meta.regularMarketDayHigh || quote?.high?.[0] || currentPrice,
        low: meta.regularMarketDayLow || quote?.low?.[0] || currentPrice,
        open: meta.regularMarketOpen || quote?.open?.[0] || currentPrice,
        previousClose,
        timestamp: (meta.regularMarketTime || Math.floor(Date.now() / 1000)) * 1000,
      };
    }
    
    return getSimulatedQuote(symbol as StockSymbol);
  } catch (error) {
    console.warn(`Failed to fetch ${symbol} from Yahoo Finance, using simulation:`, error);
    return getSimulatedQuote(symbol as StockSymbol);
  }
}

// Fetch historical candle data from Yahoo Finance
async function fetchYahooCandles(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1h' | '1d' = '1h',
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' = '5d'
): Promise<CandleData[]> {
  try {
    const url = getYahooUrl(symbol, `interval=${interval}&range=${range}`);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Yahoo Finance candle API error for ${symbol}`);
      return [];
    }
    
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) return [];
    
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const candles: CandleData[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.open?.[i] != null && quote.close?.[i] != null) {
        candles.push({
          time: timestamps[i] as UTCTimestamp,
          open: quote.open[i],
          high: quote.high?.[i] || quote.open[i],
          low: quote.low?.[i] || quote.open[i],
          close: quote.close[i],
          volume: quote.volume?.[i] || 0,
        });
      }
    }
    
    return candles;
  } catch (error) {
    console.warn(`Failed to fetch candles for ${symbol}:`, error);
    return [];
  }
}

// Generate simulated historical data based on current price
function generateHistoricalData(
  stocks: Record<StockSymbol, StockQuote>,
  points: number = 50,
  baseValue: number = 10000
): Array<{ time: UTCTimestamp; value: number; volume: number }> {
  const data: Array<{ time: UTCTimestamp; value: number; volume: number }> = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour intervals
  
  // Calculate current weighted portfolio value
  let currentValue = 0;
  Object.entries(stocks).forEach(([symbol, quote]) => {
    const weight = MAANG_STOCKS[symbol as StockSymbol].weight;
    currentValue += quote.price * weight * (baseValue / 100); // Scaled to portfolio
  });
  
  // Work backwards from current value with realistic volatility
  for (let i = 0; i < points; i++) {
    const hoursAgo = points - 1 - i;
    const timestamp = (now - hoursAgo * interval) as UTCTimestamp;
    
    // Simulate price movements with mean reversion towards current price
    const progress = i / (points - 1);
    const baseVariation = Math.sin(i * 0.15) * 0.02; // Wave pattern
    const trendVariation = (1 - progress) * 0.08 * (Math.random() - 0.5); // Decreasing randomness
    const randomNoise = (Math.random() - 0.5) * 0.015;
    
    // Calculate weighted 24h change for trend
    let avgChange = 0;
    Object.entries(stocks).forEach(([symbol, quote]) => {
      const weight = MAANG_STOCKS[symbol as StockSymbol].weight;
      avgChange += (quote.changePercent / 100) * weight;
    });
    
    // Apply trend influence - earlier data should reflect recent movements
    const trendFactor = (hoursAgo / 24) * avgChange * -1;
    
    const modifier = 1 + baseVariation + trendVariation + randomNoise + trendFactor;
    const value = currentValue * modifier;
    
    // Volume varies inversely with how far back we go
    const volumeBase = 50 + Math.random() * 80;
    const volumeModifier = 0.5 + (i / points) * 0.5;
    
    data.push({
      time: timestamp,
      value: Math.round(value * 100) / 100,
      volume: Math.round(volumeBase * volumeModifier),
    });
  }
  
  // Ensure last point matches current portfolio value
  if (data.length > 0) {
    data[data.length - 1].value = Math.round(currentValue * 100) / 100;
  }
  
  return data;
}

// Generate realistic OHLCV candlestick data
function generateCandleData(
  stocks: Record<StockSymbol, StockQuote>,
  points: number = 100,
  baseValue: number = 10000
): CandleData[] {
  const data: CandleData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour intervals
  
  // Calculate current weighted portfolio value
  let currentValue = 0;
  Object.entries(stocks).forEach(([symbol, quote]) => {
    const weight = MAANG_STOCKS[symbol as StockSymbol].weight;
    currentValue += quote.price * weight * (baseValue / 100);
  });
  
  // Calculate weighted volatility
  let avgVolatility = 0;
  Object.entries(stocks).forEach(([symbol]) => {
    const weight = MAANG_STOCKS[symbol as StockSymbol].weight;
    avgVolatility += BASE_PRICES[symbol as StockSymbol].volatility * weight;
  });
  
  let prevClose = currentValue * 0.95; // Start 5% lower for trend
  
  for (let i = 0; i < points; i++) {
    const hoursAgo = points - 1 - i;
    const timestamp = (now - hoursAgo * interval) as UTCTimestamp;
    
    // Progress towards current value
    const progress = i / (points - 1);
    const targetValue = currentValue;
    const baseOpen = prevClose + (targetValue - prevClose) * 0.02;
    
    // Add randomness
    const volatilityMultiplier = avgVolatility * 50;
    const randomOpen = baseOpen * (1 + (Math.random() - 0.5) * volatilityMultiplier);
    const randomClose = randomOpen * (1 + (Math.random() - 0.4) * volatilityMultiplier);
    
    // High and low based on open/close with extensions
    const candleBody = Math.abs(randomClose - randomOpen);
    const wickExtension = candleBody * (0.5 + Math.random() * 1.5);
    
    const open = Math.round(randomOpen * 100) / 100;
    const close = Math.round(randomClose * 100) / 100;
    const high = Math.round((Math.max(open, close) + wickExtension) * 100) / 100;
    const low = Math.round((Math.min(open, close) - wickExtension * 0.8) * 100) / 100;
    
    // Volume with variation
    const volumeBase = 10000 + Math.random() * 50000;
    const volumeSpike = Math.random() > 0.9 ? 2 + Math.random() * 3 : 1;
    const volume = Math.round(volumeBase * volumeSpike * (0.5 + progress * 0.5));
    
    data.push({
      time: timestamp,
      open,
      high,
      low: Math.max(low, 0),
      close,
      volume,
    });
    
    prevClose = close;
  }
  
  // Ensure last candle ends at current value
  if (data.length > 0) {
    data[data.length - 1].close = Math.round(currentValue * 100) / 100;
    data[data.length - 1].high = Math.max(
      data[data.length - 1].high,
      data[data.length - 1].close
    );
  }
  
  return data;
}

// Aggregate individual stock candles into a weighted portfolio candle chart
function aggregatePortfolioCandles(
  allCandles: CandleData[][],
  symbols: StockSymbol[],
  basePortfolioValue: number
): CandleData[] {
  // Find the common timestamps across all stocks
  const timestampMap = new Map<number, Map<StockSymbol, CandleData>>();
  
  allCandles.forEach((candles, idx) => {
    const symbol = symbols[idx];
    candles.forEach(candle => {
      if (!timestampMap.has(candle.time)) {
        timestampMap.set(candle.time, new Map());
      }
      timestampMap.get(candle.time)!.set(symbol, candle);
    });
  });
  
  // Convert to sorted array and aggregate
  const sortedTimestamps = Array.from(timestampMap.keys()).sort((a, b) => a - b);
  const aggregatedCandles: CandleData[] = [];
  
  sortedTimestamps.forEach(timestamp => {
    const stockCandles = timestampMap.get(timestamp)!;
    
    // Only include if we have data for at least 3 stocks
    if (stockCandles.size < 3) return;
    
    let portfolioOpen = 0;
    let portfolioHigh = 0;
    let portfolioLow = 0;
    let portfolioClose = 0;
    let portfolioVolume = 0;
    
    symbols.forEach(symbol => {
      const candle = stockCandles.get(symbol);
      const weight = MAANG_STOCKS[symbol].weight;
      const allocation = basePortfolioValue * weight;
      
      if (candle) {
        // Calculate shares based on first candle's open price
        const shares = allocation / candle.open;
        
        portfolioOpen += shares * candle.open;
        portfolioHigh += shares * candle.high;
        portfolioLow += shares * candle.low;
        portfolioClose += shares * candle.close;
        portfolioVolume += candle.volume * weight;
      } else {
        // Use base allocation if no data
        portfolioOpen += allocation;
        portfolioHigh += allocation;
        portfolioLow += allocation;
        portfolioClose += allocation;
      }
    });
    
    aggregatedCandles.push({
      time: timestamp as UTCTimestamp,
      open: Math.round(portfolioOpen * 100) / 100,
      high: Math.round(portfolioHigh * 100) / 100,
      low: Math.round(portfolioLow * 100) / 100,
      close: Math.round(portfolioClose * 100) / 100,
      volume: Math.round(portfolioVolume),
    });
  });
  
  return aggregatedCandles;
}

/**
 * Hook to fetch live MAANG stock prices and calculate portfolio value
 */
export function useStockPrices(basePortfolioValue: number = 41812.14) {
  const { data, isLoading, error, refetch } = useQuery<PortfolioData>({
    queryKey: ["maang-stock-prices", basePortfolioValue],
    refetchInterval: 30_000, // Refresh every 30 seconds
    staleTime: 15_000,
    queryFn: async () => {
      const symbols = Object.keys(MAANG_STOCKS) as StockSymbol[];
      
      // Fetch all stock quotes in parallel
      const quotePromises = symbols.map(symbol => fetchStockQuote(symbol));
      const results = await Promise.all(quotePromises);
      
      // Build stocks record with fallbacks
      const stocks: Record<StockSymbol, StockQuote> = {} as Record<StockSymbol, StockQuote>;
      let totalChange = 0;
      let totalPreviousValue = 0;
      let totalCurrentValue = 0;
      
      symbols.forEach((symbol, index) => {
        const quote = results[index];
        
        if (quote) {
          stocks[symbol] = quote;
        } else {
          // Use fallback price
          const fallbackPrice = BASE_PRICES[symbol].price;
          stocks[symbol] = {
            symbol,
            price: fallbackPrice,
            change: 0,
            changePercent: 0,
            high: fallbackPrice,
            low: fallbackPrice,
            open: fallbackPrice,
            previousClose: fallbackPrice,
            timestamp: Date.now(),
          };
        }
        
        // Calculate weighted values
        const weight = MAANG_STOCKS[symbol].weight;
        const allocation = basePortfolioValue * weight;
        const shares = allocation / stocks[symbol].previousClose;
        
        totalPreviousValue += shares * stocks[symbol].previousClose;
        totalCurrentValue += shares * stocks[symbol].price;
        totalChange += stocks[symbol].change * shares;
      });
      
      const changePercent = totalPreviousValue > 0 
        ? ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100 
        : 0;
      
      // Generate chart data based on current prices
      const chartData = generateHistoricalData(stocks, 50, basePortfolioValue / 100);
      const candleData = generateCandleData(stocks, 100, basePortfolioValue / 100);
      
      // Fetch live candle data from Yahoo Finance for all stocks
      const candlePromises = symbols.map(symbol => fetchYahooCandles(symbol, '1h', '5d'));
      const allCandles = await Promise.all(candlePromises);
      
      // Aggregate candles into portfolio-weighted candles
      const yahooCandleData = aggregatePortfolioCandles(allCandles, symbols, basePortfolioValue);
      
      return {
        totalValue: Math.round(totalCurrentValue * 100) / 100,
        change24h: Math.round(totalChange * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        stocks,
        chartData,
        candleData,
        yahooCandleData,
        lastUpdated: Date.now(),
      };
    },
  });

  // Memoize individual stock getters
  const getStockPrice = useMemo(() => {
    return (symbol: StockSymbol): number => {
      return data?.stocks[symbol]?.price || BASE_PRICES[symbol].price;
    };
  }, [data]);

  const getStockChange = useMemo(() => {
    return (symbol: StockSymbol): { change: number; percent: number } => {
      const quote = data?.stocks[symbol];
      return {
        change: quote?.change || 0,
        percent: quote?.changePercent || 0,
      };
    };
  }, [data]);

  // Generate fallback candle data for initial render
  const fallbackCandleData = useMemo(() => {
    if (data?.candleData?.length) return data.candleData;
    
    // Generate placeholder candles while loading
    const candles: CandleData[] = [];
    const now = Math.floor(Date.now() / 1000);
    const interval = 3600;
    let price = basePortfolioValue / 100;
    
    for (let i = 0; i < 50; i++) {
      const time = (now - (50 - i) * interval) as UTCTimestamp;
      const volatility = 0.005 + Math.random() * 0.01;
      const change = (Math.random() - 0.5) * price * volatility;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.003);
      const low = Math.min(open, close) * (1 - Math.random() * 0.003);
      const volume = 500000 + Math.random() * 1000000;
      
      candles.push({ time, open, high, low, close, volume: Math.round(volume) });
      price = close;
    }
    return candles;
  }, [data?.candleData, basePortfolioValue]);

  return {
    // Portfolio data
    portfolioValue: data?.totalValue || basePortfolioValue,
    portfolioChange: data?.change24h || 0,
    portfolioChangePercent: data?.changePercent || 0,
    chartData: data?.chartData || [],
    candleData: fallbackCandleData,
    yahooCandleData: data?.yahooCandleData || [], // Live candles from Yahoo Finance
    
    // Individual stocks
    stocks: data?.stocks || null,
    getStockPrice,
    getStockChange,
    
    // Status
    isLoading,
    error,
    refetch,
    lastUpdated: data?.lastUpdated || null,
    
    // Config
    stockInfo: MAANG_STOCKS,
  };
}

/**
 * Hook for historical stock data from Yahoo Finance (for extended charts)
 */
export function useStockHistory(
  symbol: StockSymbol,
  interval: '1m' | '5m' | '15m' | '1h' | '1d' = '1h',
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' = '5d'
) {
  return useQuery({
    queryKey: ["stock-history-yahoo", symbol, interval, range],
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async () => {
      return fetchYahooCandles(symbol, interval, range);
    },
  });
}

