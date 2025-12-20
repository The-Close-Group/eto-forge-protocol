import { useMemo } from 'react';
import Sparkline, { generateSparklineData } from '@/components/Sparkline';

interface BalanceCardProps {
  balance: number;
  pnlAmount: number;
  pnlPercentage: number;
  currency?: string;
  timeframe?: string;
  className?: string;
}

export function BalanceCard({
  balance,
  pnlAmount,
  pnlPercentage,
  currency = 'USD',
  timeframe = '24H',
  className = '',
}: BalanceCardProps) {
  const isPositive = pnlAmount >= 0;
  
  // Generate sparkline data based on PnL direction
  const sparkData = useMemo(() => 
    generateSparklineData(48, isPositive ? 'up' : 'down'),
    [isPositive]
  );

  // Format balance with proper currency
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  // Format PnL amount
  const formattedPnL = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  }).format(pnlAmount);

  return (
    <div className={`balance-card ${className}`}>
      {/* Header */}
      <div className="balance-card-header">
        <span className="balance-card-label">Balance</span>
        <span className="balance-card-timeframe">{timeframe}</span>
      </div>

      {/* Balance Amount */}
      <div className="balance-card-amount">
        {formattedBalance}
      </div>

      {/* PnL Indicator */}
      <div className="balance-card-pnl">
        <div className={`balance-pnl-indicator ${isPositive ? 'positive' : 'negative'}`}>
          {/* Triangle Icon */}
          <svg 
            width="10" 
            height="8" 
            viewBox="0 0 10 8" 
            fill="currentColor"
            className={`balance-pnl-triangle ${isPositive ? '' : 'rotate-180'}`}
          >
            <path d="M5 0L9.33 7.5H0.67L5 0Z" />
          </svg>
          <span className="balance-pnl-amount">{formattedPnL}</span>
          <span className="balance-pnl-percentage">({Math.abs(pnlPercentage).toFixed(2)}%)</span>
        </div>
      </div>

      {/* Expanded Sparkline - Edge to Edge */}
      <div className="balance-card-chart">
        <Sparkline 
          data={sparkData} 
          height={80}
          variant={isPositive ? 'positive' : 'negative'}
          showArea={true}
          showEndValue={false}
        />
      </div>
    </div>
  );
}

export default BalanceCard;

