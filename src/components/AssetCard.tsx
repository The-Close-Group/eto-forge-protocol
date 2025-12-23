import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline, { generateSparklineData } from '@/components/Sparkline';
import { useMemo } from 'react';

export interface AssetCardProps {
  id: string;
  name: string;
  symbol: string;
  type: string;
  logo: string;
  color: string;
  rewardRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  tvl: number;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
}

export function AssetCard({
  id,
  name,
  symbol,
  type,
  logo,
  color,
  rewardRate,
  riskLevel,
  tvl,
  isSelected = false,
  onClick,
  onDoubleClick,
  className = '',
}: AssetCardProps) {
  // Generate sparkline data based on risk level
  const sparkData = useMemo(() => 
    generateSparklineData(30, riskLevel === 'high' ? 'down' : 'up'),
    [riskLevel]
  );

  // Calculate mock price and change based on TVL
  const price = (tvl / 10000).toFixed(2);
  const changePercent = riskLevel === 'high' ? -rewardRate : rewardRate;
  const changeValue = ((tvl / 10000) * (changePercent / 100)).toFixed(2);
  const isPositive = changePercent >= 0;

  return (
    <div 
      className={`staking-asset-card cursor-pointer group relative ${isSelected ? 'ring-2 ring-primary' : ''} ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Hover tooltip */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="px-2.5 py-1.5 rounded-md bg-background/95 backdrop-blur-sm border border-border-subtle shadow-lg">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">Double click to open</span>
        </div>
      </div>
      
      {/* Header Row - Logo, Name/Symbol, Price */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          {/* Circular Logo with white/light background */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ 
              background: type === 'index' ? 'white' : `${color}15`,
              border: type === 'index' ? 'none' : `1px solid ${color}30`
            }}
          >
            <img 
              src={logo} 
              alt={name} 
              className={type === 'index' ? 'w-full h-full object-cover' : 'w-7 h-7 object-contain'}
            />
          </div>
          <div>
            <div className="text-[15px] font-semibold">{name}</div>
            <div className="text-[12px] text-muted-foreground">{symbol.toLowerCase()}.inc</div>
          </div>
        </div>

        {/* Right: Price */}
        <div className="text-right">
          <div className="text-[18px] font-semibold">${price}</div>
        </div>
      </div>
      
      {/* Change Row */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${isPositive ? 'bg-primary/10' : 'bg-data-negative/10'}`}>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-data-negative" />
          )}
          <span className={`text-[12px] font-medium ${isPositive ? 'text-primary' : 'text-data-negative'}`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
        </div>
        <span className={`text-[12px] font-medium ${isPositive ? 'text-primary' : 'text-data-negative'}`}>
          {isPositive ? '+' : '-'}${Math.abs(parseFloat(changeValue)).toFixed(2)}
        </span>
        <span className="text-[11px] text-muted-foreground">Today</span>
      </div>
      
      {/* Sparkline - Full Width */}
      <div className="relative -mx-1">
        <Sparkline 
          data={sparkData} 
          height={70}
          variant={isPositive ? 'positive' : 'negative'}
          showArea={true}
        />
      </div>
    </div>
  );
}

export default AssetCard;


