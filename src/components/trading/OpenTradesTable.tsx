import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Settings2, ChevronDown, X } from 'lucide-react';

interface Position {
  id: string;
  time: Date;
  market: string;
  side: 'long' | 'short';
  size: number;
  collateral: number;
  entryPrice: number;
  marketPrice: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
}

interface OpenTradesTableProps {
  symbol?: string;
  currentPrice?: number;
  positions?: Position[];
  onClosePosition?: (id: string) => void;
}

// Mock positions for demo
const generateMockPositions = (currentPrice: number): Position[] => [
  {
    id: '1',
    time: new Date(Date.now() - 3600000),
    market: 'MAANG/mUSDC',
    side: 'long',
    size: 0.146052,
    collateral: 100,
    entryPrice: currentPrice * 0.995,
    marketPrice: currentPrice,
    leverage: 10,
    takeProfit: currentPrice * 1.05,
    stopLoss: currentPrice * 0.92,
  },
  {
    id: '2',
    time: new Date(Date.now() - 7200000),
    market: 'ETH/USD',
    side: 'short',
    size: 2.5,
    collateral: 500,
    entryPrice: 3450.00,
    marketPrice: 3412.50,
    leverage: 25,
  },
];

export function OpenTradesTable({ 
  symbol = 'MAANG',
  currentPrice = 6844.78,
  positions: externalPositions,
  onClosePosition,
}: OpenTradesTableProps) {
  const [activeTab, setActiveTab] = useState<'trades' | 'orders' | 'history'>('trades');
  const [showSymbol, setShowSymbol] = useState(true);
  
  const positions = useMemo(() => 
    externalPositions || generateMockPositions(currentPrice),
    [externalPositions, currentPrice]
  );

  const calculatePnL = (position: Position) => {
    const priceDiff = position.side === 'long' 
      ? position.marketPrice - position.entryPrice
      : position.entryPrice - position.marketPrice;
    return priceDiff * position.size;
  };

  const calculatePnLPercent = (position: Position) => {
    const pnl = calculatePnL(position);
    return (pnl / position.collateral) * 100;
  };

  const calculateNetValue = (position: Position) => {
    const pnl = calculatePnL(position);
    return position.collateral + pnl;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 24) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return `${hours}h ${minutes}m ago`;
  };

  const totalPnL = positions.reduce((sum, pos) => sum + calculatePnL(pos), 0);

  return (
    <div className="open-trades-table">
      {/* Header with tabs */}
      <div className="open-trades-header">
        <div className="open-trades-tabs">
          <button
            className={`open-trades-tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            Trades ({positions.length})
          </button>
          <button
            className={`open-trades-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`open-trades-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
        
        <div className="open-trades-actions">
          <button 
            className="open-trades-filter-btn"
            onClick={() => setShowSymbol(!showSymbol)}
          >
            Show {symbol}
          </button>
          <button className="open-trades-settings-btn">
            <Settings2 size={14} />
          </button>
          <button className="open-trades-export-btn">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="open-trades-content">
        {positions.length === 0 ? (
          <div className="open-trades-empty">
            <span>No Open Trades</span>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="open-trades-row header">
              <span className="col-time">Time</span>
              <span className="col-market">Market & Side</span>
              <span className="col-size">Size</span>
              <span className="col-collateral">Collateral</span>
              <span className="col-entry">Entry Price</span>
              <span className="col-market-price">Market Price</span>
              <span className="col-net">Net Value</span>
              <span className="col-close">Close Price</span>
              <span className="col-pnl">Unrealized PNL</span>
              <span className="col-actions"></span>
            </div>

            {/* Table Body */}
            {positions.map((position) => {
              const pnl = calculatePnL(position);
              const pnlPercent = calculatePnLPercent(position);
              const netValue = calculateNetValue(position);
              const isProfit = pnl >= 0;

              return (
                <div key={position.id} className="open-trades-row">
                  <span className="col-time">
                    {formatTime(position.time)}
                  </span>
                  <span className="col-market">
                    <span className="market-name">{position.market}</span>
                    <span className={`market-side ${position.side}`}>
                      {position.side.toUpperCase()} {position.leverage}x
                    </span>
                  </span>
                  <span className="col-size">
                    {position.size.toFixed(4)}
                  </span>
                  <span className="col-collateral">
                    ${position.collateral.toFixed(2)}
                  </span>
                  <span className="col-entry">
                    ${position.entryPrice.toFixed(2)}
                  </span>
                  <span className="col-market-price">
                    ${position.marketPrice.toFixed(2)}
                  </span>
                  <span className={`col-net ${isProfit ? 'positive' : 'negative'}`}>
                    ${netValue.toFixed(2)}
                  </span>
                  <span className="col-close">
                    ${position.marketPrice.toFixed(2)}
                  </span>
                  <span className={`col-pnl ${isProfit ? 'positive' : 'negative'}`}>
                    <span className="pnl-value">
                      {isProfit ? '+' : ''}{pnl.toFixed(2)}
                    </span>
                    <span className="pnl-percent">
                      ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </span>
                  </span>
                  <span className="col-actions">
                    <button 
                      className="close-position-btn"
                      onClick={() => onClosePosition?.(position.id)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                </div>
              );
            })}

            {/* Total PnL Bar */}
            <div className="open-trades-total">
              <span>Total Unrealized PNL:</span>
              <span className={totalPnL >= 0 ? 'positive' : 'negative'}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="open-trades-status">
        <div className="status-indicator online">
          <span className="status-dot" />
          Online
        </div>
        <div className="status-favorites">
          Favorites <ChevronDown size={12} />
        </div>
        <span className="status-none">None</span>
      </div>
    </div>
  );
}

export default OpenTradesTable;

