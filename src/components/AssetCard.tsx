import { Check } from 'lucide-react';
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
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5"
            style={{ background: `${color}15` }}
          >
            <img src={logo} alt={name} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{type.toUpperCase()}</div>
            <div className="text-[13px] font-medium">{name}</div>
          </div>
        </div>
        {isSelected && <Check className="w-4 h-4 text-primary" />}
      </div>
      
      {/* Reward Rate */}
      <div className="mb-3">
        <div className="reward-rate-label">Reward Rate</div>
        <div className="flex items-baseline gap-0.5">
          <span className="reward-rate">{rewardRate.toFixed(2)}</span>
          <span className="text-xl text-muted-foreground font-normal">%</span>
        </div>
      </div>
      
      {/* Risk Badge */}
      <div className={`status-badge ${riskLevel === 'low' ? 'status-badge-positive' : riskLevel === 'high' ? 'status-badge-negative' : ''} mb-4`}>
        <span className="w-[6px] h-[6px] rounded-full bg-current" />
        {riskLevel} risk
      </div>
      
      {/* Sparkline */}
      <div className="relative">
        <Sparkline 
          data={sparkData} 
          height={60}
          variant={riskLevel !== 'high' ? 'positive' : 'negative'}
          showArea={true}
          showEndValue={true}
          endValue={`$${(tvl / 1000000).toFixed(1)}M TVL`}
        />
      </div>
    </div>
  );
}

export default AssetCard;


