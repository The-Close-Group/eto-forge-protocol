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
  // React Hook must be called before any conditional returns
  const uniqueId = React.useId().replace(/:/g, '');

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

export const generateSparklineData = (length: number = 20, trend: 'up' | 'down' | 'flat' = 'up') => {
  const data: number[] = [];
  let value = 50;
  
  for (let i = 0; i < length; i++) {
    const volatility = trend === 'flat' ? 2 : 6;
    const change = (Math.random() - 0.5) * volatility;
    const bias = trend === 'up' ? 0.25 : trend === 'down' ? -0.25 : 0;
    value = Math.max(15, Math.min(85, value + change + bias));
    data.push(value);
  }
  
  return data;
};
