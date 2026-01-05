import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RWAAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  icon: string;
}

// Simulated RWA price data - in production, connect to real APIs
const generateRWAPrices = (): RWAAsset[] => {
  const baseAssets = [
    { symbol: 'XAU', name: 'Gold', basePrice: 2634.50, icon: '🥇' },
    { symbol: 'XAG', name: 'Silver', basePrice: 31.24, icon: '🥈' },
    { symbol: 'WTI', name: 'Crude Oil', basePrice: 71.82, icon: '🛢️' },
    { symbol: 'MAANG', name: 'MAANG Index', basePrice: 6012.45, icon: '📈' },
    { symbol: 'NDX', name: 'Nasdaq 100', basePrice: 21432.10, icon: '💹' },
    { symbol: 'DXY', name: 'US Dollar', basePrice: 108.24, icon: '💵' },
    { symbol: 'BTC', name: 'Bitcoin', basePrice: 94521.00, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', basePrice: 3412.50, icon: 'Ξ' },
    { symbol: 'PAXG', name: 'PAX Gold', basePrice: 2631.80, icon: '🏆' },
    { symbol: 'RWA', name: 'RWA Index', basePrice: 142.35, icon: '🏠' },
    { symbol: 'TBILL', name: 'T-Bills', basePrice: 100.12, icon: '📜' },
    { symbol: 'BOND', name: 'Bond ETF', basePrice: 89.45, icon: '📊' },
  ];

  return baseAssets.map(asset => {
    const volatility = asset.symbol === 'TBILL' ? 0.001 : asset.symbol === 'BTC' ? 0.02 : 0.005;
    const change = (Math.random() - 0.5) * 2 * volatility * asset.basePrice;
    const price = asset.basePrice + change;
    const changePercent = (change / asset.basePrice) * 100;

    return {
      symbol: asset.symbol,
      name: asset.name,
      price,
      change,
      changePercent,
      icon: asset.icon,
    };
  });
};

export function RWAPriceTicker() {
  const [assets, setAssets] = useState<RWAAsset[]>(generateRWAPrices);
  const [isPaused, setIsPaused] = useState(false);

  // Update prices every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => {
        return prev.map(asset => {
          const volatility = asset.symbol === 'TBILL' ? 0.0005 : asset.symbol === 'BTC' ? 0.01 : 0.003;
          const priceChange = (Math.random() - 0.5) * 2 * volatility * asset.price;
          const newPrice = Math.max(asset.price + priceChange, 0.01);
          const totalChange = asset.change + priceChange;
          const changePercent = (totalChange / (asset.price - asset.change)) * 100;

          return {
            ...asset,
            price: newPrice,
            change: totalChange,
            changePercent,
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'BTC' || symbol === 'ETH' || symbol === 'NDX' || symbol === 'MAANG') {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(2);
  };

  // Duplicate assets for seamless scroll
  const scrollAssets = useMemo(() => [...assets, ...assets], [assets]);

  return (
    <div 
      className="rwa-ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="rwa-ticker-label">
        <span className="rwa-ticker-dot" />
        <span>RWA Prices</span>
      </div>
      
      <div className="rwa-ticker-track">
        <div 
          className="rwa-ticker-content"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {scrollAssets.map((asset, idx) => {
            const isPositive = asset.changePercent >= 0;
            return (
              <div key={`${asset.symbol}-${idx}`} className="rwa-ticker-item">
                <span className="rwa-ticker-icon">{asset.icon}</span>
                <span className="rwa-ticker-symbol">{asset.symbol}</span>
                <span className="rwa-ticker-price">${formatPrice(asset.price, asset.symbol)}</span>
                <span className={`rwa-ticker-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RWAPriceTicker;

