import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
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
      {/* Header Row - Logo, Name/Symbol, Price + Change */}
      <div className="flex items-start justify-between mb-4 sm:mb-5 gap-2">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Logo Container - Rounded rectangle for MAANG, circular for index */}
          <div 
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 overflow-hidden ${
              (type === 'defi' || type === 'liquid') 
                ? 'rounded-lg sm:rounded-xl'  // Rounded rectangle for MAANG/sMAANG
                : 'rounded-full'  // Circular for index/stablecoin
            }`}
          >
            <img 
              src={logo} 
              alt={name} 
              className={
                (type === 'index' || type === 'stablecoin')
                  ? 'w-full h-full object-cover rounded-full'  // Fill container
                  : 'w-6 h-6 sm:w-8 sm:h-8 object-contain'  // Responsive logo size
              }
            />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] sm:text-[15px] font-semibold truncate">{name}</div>
            <div className="text-[11px] sm:text-[12px] text-muted-foreground truncate">{symbol.toLowerCase()}.inc</div>
          </div>
        </div>

        {/* Right: Price + Change underneath */}
        <div className="text-right flex-shrink-0">
          <div className="text-[16px] sm:text-[18px] font-semibold mb-1 sm:mb-1.5">${price}</div>
          <div className="flex items-center gap-1 sm:gap-1.5 justify-end flex-wrap">
            <div className={`flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded ${isPositive ? 'bg-primary/10' : 'bg-data-negative/10'}`}>
              {isPositive ? (
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-data-negative" />
              )}
              <span className={`text-[10px] sm:text-[11px] font-medium ${isPositive ? 'text-primary' : 'text-data-negative'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
              </span>
            </div>
            <span className={`text-[10px] sm:text-[11px] font-medium hidden xs:inline ${isPositive ? 'text-primary' : 'text-data-negative'}`}>
              {isPositive ? '+' : '-'}${Math.abs(parseFloat(changeValue)).toFixed(2)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">Today</span>
          </div>
        </div>
      </div>
      
      {/* Sparkline - Full Width */}
      <div className="relative -mx-1 sm:-mx-1">
        <Sparkline 
          data={sparkData} 
          height={55}
          variant={isPositive ? 'positive' : 'negative'}
          showArea={true}
        />
      </div>

      {/* Trade Button - Always visible */}
      <div className="mt-4 pt-3 border-t border-border-subtle">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[13px] transition-all duration-200 group/btn">
          <span>Trade {symbol}</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default AssetCard;


