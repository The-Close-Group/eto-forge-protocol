import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import CoinIcon from "@/components/CoinIcon";

interface ChartCardProps {
  asset: string;
  timeframe: string;
}

export function ChartCard({ asset, timeframe }: ChartCardProps) {
  // Generate mock data
  const generateData = () => {
    const points = 24;
    const basePrice = asset === 'MAANG' ? 33 : asset === 'ETH' ? 3200 : asset === 'SOL' ? 140 : asset === 'AVAX' ? 35 : 1;
    return Array.from({ length: points }, (_, i) => ({
      time: `${i}:00`,
      price: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
    }));
  };

  const data = generateData();
  const currentPrice = data[data.length - 1].price;
  const startPrice = data[0].price;
  const change = ((currentPrice - startPrice) / startPrice) * 100;
  const isPositive = change >= 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CoinIcon symbol={asset} className="h-8 w-8" />
          <div>
            <p className="font-bold text-lg">{asset}</p>
            <p className="text-xs text-muted-foreground">{timeframe}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          <div className={`flex items-center gap-1 justify-end ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`h-3 w-3 ${!isPositive && 'rotate-180'}`} />
            <span className="text-xs font-medium">{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            domain={['dataMin - 5', 'dataMax + 5']}
            tick={{ fontSize: 10 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Activity className="h-3 w-3" />
        <span>Live market data</span>
      </div>
    </Card>
  );
}
