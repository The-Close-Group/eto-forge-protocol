import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import maangLogo from '@/assets/maang-logo.svg';

interface RecentTrade {
  price: number;
  amount: number;
  total: number;
  type: 'buy' | 'sell';
}

const mockRecentTrades: RecentTrade[] = [
  { price: 1.2407, amount: 393.8018, total: 488.5898, type: 'buy' },
  { price: 1.2406, amount: 741.4366, total: 919.8262, type: 'buy' },
  { price: 1.2390, amount: 0.9987, total: 1.2373, type: 'sell' },
  { price: 1.2387, amount: 1.0000, total: 1.2387, type: 'sell' },
  { price: 1.2386, amount: 1.0000, total: 1.2386, type: 'sell' },
  { price: 1.2385, amount: 100.7391, total: 124.7653, type: 'sell' },
  { price: 1.2381, amount: 0.9986, total: 1.2363, type: 'sell' },
  { price: 1.2380, amount: 1.0363, total: 1.2829, type: 'sell' },
  { price: 1.2369, amount: 8.6268, total: 10.6704, type: 'buy' },
  { price: 1.2325, amount: 297.9694, total: 367.2472, type: 'buy' },
];

export function TradingPanel() {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('100');

  const ethEquivalent = (parseFloat(amount || '0') / 3300).toFixed(3);

  return (
    <div className="flex flex-col h-full">
      {/* Buy/Sell Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setMode('buy')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
              mode === 'buy'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
              mode === 'sell'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">You're {mode === 'buy' ? 'buying' : 'selling'}</span>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
              $
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
        <div className="text-center py-6">
          <div className="text-5xl font-bold text-foreground tracking-tight">
            ${amount || '0'}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {ethEquivalent} ETH
          </div>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="sr-only"
        />
      </div>

      {/* Amount Presets */}
      <div className="flex gap-2 mb-4">
        {['50', '100', '250', '500'].map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all border ${
              amount === preset
                ? 'bg-background text-foreground border-border shadow-sm'
                : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
            }`}
          >
            ${preset}
          </button>
        ))}
      </div>

      {/* MAANG Selector */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center p-1.5">
            <img src={maangLogo} alt="MAANG" className="w-full h-full" />
          </div>
          <span className="font-semibold text-foreground">MAANG</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Continue Button */}
      <button className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/20">
        Continue
      </button>

      {/* Recent Trades */}
      <div className="mt-6 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground tracking-wider">RECENT TRADES</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400">1.24075 AVAX</span>
            <span className="text-muted-foreground">SPREAD: <span className="text-foreground">0.8 BPS</span></span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-emerald-500 via-emerald-500 to-transparent mb-3" />

        <div className="space-y-1 overflow-y-auto max-h-[280px]">
          {mockRecentTrades.map((trade, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-sm font-mono">
              <span className={trade.type === 'buy' ? 'text-emerald-400' : 'text-muted-foreground'}>
                {trade.price.toFixed(4)}
              </span>
              <span className="text-muted-foreground">{trade.amount.toFixed(4)}</span>
              <span className="text-foreground">{trade.total.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TradingPanel;
