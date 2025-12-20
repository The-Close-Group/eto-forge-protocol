import { useMemo } from 'react';
import Sparkline, { generateSparklineData } from '@/components/Sparkline';
import maangLogo from '@/assets/maang-logo.svg';

interface Holding {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  color: string;
  balance: number;
  value: number;
  change: number;
  type: string;
}

interface HoldingsCardProps {
  className?: string;
}

const holdings: Holding[] = [
  {
    id: 'maang',
    name: 'MAANG',
    symbol: 'MAANG',
    logo: maangLogo,
    color: '#10b981',
    balance: 1250.50,
    value: 15632.25,
    change: 2.34,
    type: 'defi',
  },
  {
    id: 'smaang',
    name: 'Staked MAANG',
    symbol: 'sMAANG',
    logo: maangLogo,
    color: '#8b5cf6',
    balance: 890.00,
    value: 11125.00,
    change: 1.89,
    type: 'liquid',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: '#2775ca',
    balance: 15054.89,
    value: 15054.89,
    change: 0.00,
    type: 'stablecoin',
  },
];

function HoldingItem({ holding }: { holding: Holding }) {
  const sparkData = useMemo(() => 
    generateSparklineData(20, holding.change >= 0 ? 'up' : 'down'),
    [holding.change]
  );

  return (
    <div className="holding-item">
      {/* Header with logo and name */}
      <div className="holding-header">
        <div className="holding-icon-wrap">
          <div 
            className="holding-icon"
            style={{ background: `${holding.color}15` }}
          >
            <img src={holding.logo} alt={holding.name} />
          </div>
        </div>
        <div className="holding-info">
          <span className="holding-type">{holding.type.toUpperCase()}</span>
          <span className="holding-name">{holding.name}</span>
        </div>
      </div>

      {/* Balance */}
      <div className="holding-balance">
        <span className="holding-balance-label">Balance</span>
        <div className="holding-balance-value">
          <span className="holding-amount">{holding.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="holding-symbol">{holding.symbol}</span>
        </div>
      </div>

      {/* Value & Change */}
      <div className="holding-value-section">
        <span className="holding-usd">${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        <span className={`holding-change ${holding.change >= 0 ? 'positive' : 'negative'}`}>
          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
        </span>
      </div>

      {/* Mini Chart */}
      <div className="holding-chart">
        <Sparkline 
          data={sparkData} 
          height={40}
          variant={holding.change >= 0 ? 'positive' : 'negative'}
          showArea={true}
        />
      </div>
    </div>
  );
}

export function HoldingsCard({ className = '' }: HoldingsCardProps) {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className={`holdings-card ${className}`}>
      <div className="holdings-header">
        <h3 className="holdings-title">Holdings</h3>
        <span className="holdings-total">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      
      <div className="holdings-grid">
        {holdings.map((holding) => (
          <HoldingItem key={holding.id} holding={holding} />
        ))}
      </div>
    </div>
  );
}

export default HoldingsCard;

