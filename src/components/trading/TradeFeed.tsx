import { useState, useEffect, useRef } from 'react';

interface Trade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: Date;
}

interface TradeFeedProps {
  symbol?: string;
  basePrice?: number;
  maxTrades?: number;
}

const generateTrade = (basePrice: number, id: number): Trade => {
  const side = Math.random() > 0.5 ? 'buy' : 'sell';
  const priceVariation = (Math.random() - 0.5) * 0.002 * basePrice;
  const price = basePrice + priceVariation;
  const amount = Math.random() * 200 + 0.5;
  
  return {
    id: `trade-${id}-${Date.now()}`,
    price,
    amount,
    side,
    time: new Date(),
  };
};

export function TradeFeed({ 
  symbol = 'MAANG', 
  basePrice = 6844.78,
  maxTrades = 25,
}: TradeFeedProps) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    // Initialize with some trades
    return Array.from({ length: 20 }, (_, i) => generateTrade(basePrice, i));
  });
  const [activeTab, setActiveTab] = useState<'order-book' | 'recent-trades'>('recent-trades');
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate incoming trades
  useEffect(() => {
    const interval = setInterval(() => {
      setTrades(prev => {
        const newTrade = generateTrade(basePrice, prev.length);
        const updated = [newTrade, ...prev];
        return updated.slice(0, maxTrades);
      });
    }, Math.random() * 1500 + 500);

    return () => clearInterval(interval);
  }, [basePrice, maxTrades]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="trade-feed">
      {/* Tabs */}
      <div className="trade-feed-tabs">
        <button
          className={`trade-feed-tab ${activeTab === 'order-book' ? 'active' : ''}`}
          onClick={() => setActiveTab('order-book')}
        >
          ORDER BOOK
        </button>
        <button
          className={`trade-feed-tab ${activeTab === 'recent-trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent-trades')}
        >
          RECENT TRADES
        </button>
      </div>

      {activeTab === 'recent-trades' ? (
        <>
          {/* Header */}
          <div className="trade-feed-header">
            <span>Price</span>
            <span>Amount</span>
            <span>Time</span>
          </div>

          {/* Trades List */}
          <div className="trade-feed-list" ref={containerRef}>
            {trades.map((trade, index) => (
              <div 
                key={trade.id} 
                className={`trade-feed-row ${trade.side} ${index === 0 ? 'new' : ''}`}
              >
                <span className={`trade-feed-price ${trade.side}`}>
                  {trade.price.toFixed(4)}
                </span>
                <span className="trade-feed-amount">
                  {trade.amount.toFixed(4)}
                </span>
                <span className="trade-feed-time">
                  {formatTime(trade.time)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="trade-feed-orderbook">
          {/* Simulated Order Book */}
          <div className="trade-feed-header">
            <span>Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
          <div className="orderbook-asks">
            {Array.from({ length: 8 }, (_, i) => {
              const price = basePrice + (8 - i) * 0.0001 * basePrice;
              const size = Math.random() * 500 + 50;
              return (
                <div key={`ask-${i}`} className="orderbook-row sell">
                  <span className="text-data-negative">{price.toFixed(4)}</span>
                  <span>{size.toFixed(2)}</span>
                  <span>{(size * price).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="orderbook-spread">
            <span className="orderbook-midprice">{basePrice.toFixed(4)}</span>
            <span className="orderbook-spread-label">Spread: 0.01%</span>
          </div>
          <div className="orderbook-bids">
            {Array.from({ length: 8 }, (_, i) => {
              const price = basePrice - (i + 1) * 0.0001 * basePrice;
              const size = Math.random() * 500 + 50;
              return (
                <div key={`bid-${i}`} className="orderbook-row buy">
                  <span className="text-data-positive">{price.toFixed(4)}</span>
                  <span>{size.toFixed(2)}</span>
                  <span>{(size * price).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TradeFeed;

