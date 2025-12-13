import React from "react";

interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
  variant?: 'default' | 'positive' | 'negative' | 'accent';
  showArea?: boolean;
  showEndValue?: boolean;
  endValue?: string;
}

export default function Sparkline({ 
  data, 
  height = 48, 
  className, 
  variant = 'default',
  showArea = true,
  showEndValue = false,
  endValue
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padY = 3;
  const padX = 1;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (100 - padX * 2);
    const y = padY + (1 - (v - min) / range) * (100 - padY * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x},98 L ${firstPoint.x},98 Z`;

  // Colors - using mint green for accent/default
  const colors = {
    default: {
      stroke: '#4dd4ac', // Mint green
      gradientStart: 'rgba(77, 212, 172, 0.25)',
      gradientEnd: 'rgba(77, 212, 172, 0)'
    },
    positive: {
      stroke: '#4dd4ac',
      gradientStart: 'rgba(77, 212, 172, 0.25)',
      gradientEnd: 'rgba(77, 212, 172, 0)'
    },
    negative: {
      stroke: '#f87171',
      gradientStart: 'rgba(248, 113, 113, 0.25)',
      gradientEnd: 'rgba(248, 113, 113, 0)'
    },
    accent: {
      stroke: '#4dd4ac', // Mint green
      gradientStart: 'rgba(77, 212, 172, 0.22)',
      gradientEnd: 'rgba(77, 212, 172, 0)'
    }
  };

  const color = colors[variant];
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div className={`relative ${className || ''}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`grad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color.gradientStart} />
            <stop offset="100%" stopColor={color.gradientEnd} />
          </linearGradient>
        </defs>

        {showArea && (
          <path d={areaPath} fill={`url(#grad-${uniqueId})`} />
        )}
        
        <path
          d={linePath}
          fill="none"
          stroke={color.stroke}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      
      {showEndValue && endValue && (
        <span 
          className={`absolute top-0 right-0 text-[11px] font-medium ${
            variant === 'positive' ? 'text-[#4dd4ac]' : 
            variant === 'negative' ? 'text-[#f87171]' : 
            'text-[#4dd4ac]'
          }`}
        >
          {endValue}
        </span>
      )}
    </div>
  );
}

// Seeded random number generator for consistent data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Cache for sparkline data to prevent regeneration on re-renders
const sparklineCache = new Map<string, number[]>();

/**
 * Generate stable sparkline data with seeded randomness
 * Data is cached to prevent "dancing" on re-renders
 * 
 * @param length - Number of data points (default: 20)
 * @param trend - Direction: 'up', 'down', or 'flat'
 * @param seed - Unique identifier for consistent data (e.g., asset ID)
 */
export const generateSparklineData = (
  length: number = 20, 
  trend: 'up' | 'down' | 'flat' = 'up',
  seed?: string | number
) => {
  // Create a cache key based on parameters
  const cacheKey = `${length}-${trend}-${seed ?? 'default'}`;
  
  // Return cached data if available (prevents re-generation on re-renders)
  if (sparklineCache.has(cacheKey)) {
    return sparklineCache.get(cacheKey)!;
  }
  
  const data: number[] = [];
  let value = 50;
  
  // Use seed for deterministic random values
  const baseSeed = typeof seed === 'string' 
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : (seed ?? 42);
  
  for (let i = 0; i < length; i++) {
    // Use seeded random for consistent results
    const random = seededRandom(baseSeed + i * 7.13);
    
    // Low volatility for stable 6-hour interval data
    const volatility = trend === 'flat' ? 0.5 : 1.2;
    const change = (random - 0.5) * volatility;
    const bias = trend === 'up' ? 0.12 : trend === 'down' ? -0.12 : 0;
    value = Math.max(30, Math.min(70, value + change + bias));
    data.push(value);
  }
  
  // Cache the result permanently (data won't change until page refresh)
  sparklineCache.set(cacheKey, data);
  
  return data;
};

/**
 * Convert price candle data from subgraph to sparkline format
 * Use this for real historical data from the subgraph
 */
export const priceCandlesToSparkline = (
  candles: Array<{ oracleClose?: string; dmmClose?: string; periodStart?: string }>,
  priceType: 'oracle' | 'dmm' = 'oracle'
): number[] => {
  if (!candles || candles.length === 0) return [];
  
  const prices = candles
    .sort((a, b) => Number(a.periodStart || 0) - Number(b.periodStart || 0))
    .map(c => {
      const price = priceType === 'oracle' ? c.oracleClose : c.dmmClose;
      return parseFloat(price || '0');
    })
    .filter(p => p > 0);
  
  return prices;
};
