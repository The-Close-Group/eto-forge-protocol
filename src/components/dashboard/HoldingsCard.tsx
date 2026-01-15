import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, ExternalLink } from 'lucide-react';
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
  apy?: number;
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
    apy: 1.51,
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
    apy: 3.24,
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
    apy: 0.05,
  },
];

function HoldingItem({ holding }: { holding: Holding }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="holding-item group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quick action on hover */}
      <div className="holding-quick-action">
        <ExternalLink className="w-3.5 h-3.5" />
      </div>

      {/* Header with logo and name */}
      <div className="holding-header">
        <div className="holding-icon-wrap">
          <div 
            className="holding-icon"
            style={{ background: `${holding.color}15`, borderColor: `${holding.color}30` }}
          >
            <img src={holding.logo} alt={holding.name} />
          </div>
        </div>
        <div className="holding-info">
          <div className="holding-type-badge" style={{ background: `${holding.color}15`, color: holding.color }}>
            {holding.type.toUpperCase()}
          </div>
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
          {holding.change >= 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
        </span>
      </div>

      {/* APY Badge */}
      {holding.apy && holding.apy > 0 && (
        <div className="holding-apy">
          <TrendingUp className="w-3 h-3" />
          <span>{holding.apy.toFixed(2)}% APY</span>
        </div>
      )}
    </div>
  );
}

export function HoldingsCard({ className = '' }: HoldingsCardProps) {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalChange = holdings.reduce((sum, h) => sum + (h.value * h.change / 100), 0);
  const totalChangePercent = (totalChange / totalValue) * 100;

  return (
    <div className={`holdings-card ${className}`}>
      <div className="holdings-header">
        <div className="holdings-header-left">
          <h3 className="holdings-title">Portfolio Holdings</h3>
          <span className="holdings-count">{holdings.length} assets</span>
        </div>
        <div className="holdings-header-right">
          <span className="holdings-total">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className={`holdings-total-change ${totalChangePercent >= 0 ? 'positive' : 'negative'}`}>
            {totalChangePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
          </span>
        </div>
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

