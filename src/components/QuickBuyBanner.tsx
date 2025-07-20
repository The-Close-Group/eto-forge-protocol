
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Zap } from "lucide-react";

interface QuickBuyAsset {
  symbol: string;
  name: string;
  price: number;
  icon: string;
  trending?: boolean;
  change24h: number;
}

interface QuickBuyBannerProps {
  onQuickBuy: (asset: string, amount: string) => void;
}

const QUICK_BUY_ASSETS: QuickBuyAsset[] = [
  { symbol: "MAANG", name: "Meta AI & Analytics", price: 238.00, icon: "🤖", trending: true, change24h: 5.2 },
  { symbol: "ETH", name: "Ethereum", price: 3567.00, icon: "⟐", change24h: 2.1 },
  { symbol: "BTC", name: "Bitcoin", price: 45000.00, icon: "₿", change24h: 1.8 },
  { symbol: "AVAX", name: "Avalanche", price: 26.00, icon: "🔺", trending: true, change24h: 3.7 },
  { symbol: "USDC", name: "USD Coin", price: 1.00, icon: "💵", change24h: 0.0 },
];

export function QuickBuyBanner({ onQuickBuy }: QuickBuyBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % QUICK_BUY_ASSETS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-background via-accent/10 to-background">
        <div 
          className="flex transition-transform duration-1000 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {QUICK_BUY_ASSETS.map((asset, index) => (
            <div key={asset.symbol} className="min-w-full flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-sm flex items-center justify-center">
                  <span className="text-2xl">{asset.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-mono">{asset.symbol}</h3>
                    {asset.trending && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-data-positive/20 rounded-sm">
                        <TrendingUp className="h-3 w-3 text-data-positive" />
                        <span className="text-xs font-medium text-data-positive">TRENDING</span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{asset.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-mono font-bold">
                      ${asset.price.toLocaleString()}
                    </span>
                    <span className={`text-sm font-mono ${
                      asset.change24h >= 0 ? 'text-data-positive' : 'text-data-negative'
                    }`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => onQuickBuy(asset.symbol, "100")}
                  className="min-w-20"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  $100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickBuy(asset.symbol, "500")}
                  className="min-w-20"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  $500
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicator dots */}
        <div className="absolute bottom-2 right-4 flex gap-1">
          {QUICK_BUY_ASSETS.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
