import { useMemo } from 'react';

interface Holding {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  paid: number;
  pnl: number;
  pnlPercent: number;
  balance: number;
}

interface HoldingsCardProps {
  holdings: Holding[];
  className?: string;
}

export function HoldingsCard({ holdings, className = '' }: HoldingsCardProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format balance with symbol
  const formatBalance = (value: number, symbol: string) => {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${symbol}`;
  };

  return (
    <div className={`holdings-card ${className}`}>
      {/* Header */}
      <div className="holdings-header">
        <span className="holdings-title">Holdings</span>
        <span className="holdings-count">{holdings.length} Assets</span>
      </div>

      {/* Column Headers */}
      <div className="holdings-columns">
        <div className="holdings-col holdings-col-asset">Asset</div>
        <div className="holdings-col holdings-col-price">Price</div>
        <div className="holdings-col holdings-col-paid">Paid</div>
        <div className="holdings-col holdings-col-pnl">PnL</div>
        <div className="holdings-col holdings-col-pnl-percent">PnL%</div>
        <div className="holdings-col holdings-col-balance">Balance</div>
      </div>

      {/* Holdings List */}
      <div className="holdings-list">
        {holdings.length === 0 ? (
          <div className="holdings-empty">
            <span>No holdings yet</span>
          </div>
        ) : (
          holdings.map((holding) => (
            <div key={holding.id} className="holdings-row">
              {/* Asset */}
              <div className="holdings-col holdings-col-asset">
                <div className="holdings-asset">
                  <img 
                    src={holding.logo} 
                    alt={holding.name} 
                    className="holdings-asset-icon"
                  />
                  <div className="holdings-asset-info">
                    <span className="holdings-asset-symbol">{holding.symbol}</span>
                    <span className="holdings-asset-name">{holding.name}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="holdings-col holdings-col-price">
                <span className="holdings-value">{formatCurrency(holding.price)}</span>
              </div>

              {/* Paid */}
              <div className="holdings-col holdings-col-paid">
                <span className="holdings-value">{formatCurrency(holding.paid)}</span>
              </div>

              {/* PnL */}
              <div className="holdings-col holdings-col-pnl">
                <span className={`holdings-value ${holding.pnl >= 0 ? 'holdings-positive' : 'holdings-negative'}`}>
                  {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                </span>
              </div>

              {/* PnL% */}
              <div className="holdings-col holdings-col-pnl-percent">
                <span className={`holdings-percent ${holding.pnlPercent >= 0 ? 'holdings-positive' : 'holdings-negative'}`}>
                  {formatPercent(holding.pnlPercent)}
                </span>
              </div>

              {/* Balance */}
              <div className="holdings-col holdings-col-balance">
                <span className="holdings-balance">{formatBalance(holding.balance, holding.symbol)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HoldingsCard;


