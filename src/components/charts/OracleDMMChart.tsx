import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePriceHistory } from "@/hooks/useDeFiPrices";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";

export function OracleDMMChart() {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const { data: priceHistory, isLoading } = usePriceHistory(timeRange);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case "1h":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "24h":
        return date.toLocaleTimeString([], { hour: '2-digit' });
      case "7d":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case "30d":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString();
    }
  };

  const chartData = priceHistory?.map(item => ({
    time: formatTimestamp(item.timestamp),
    timestamp: item.timestamp,
    "Oracle Price": item.oraclePrice,
    "DMM Price": item.dmmPrice,
    difference: Math.abs(item.oraclePrice - item.dmmPrice),
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Oracle vs DMM Price History
        </CardTitle>
        <div className="flex gap-1">
          {(["1h", "24h", "7d", "30d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="text-xs"
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 0.01', 'dataMax + 0.01']}
                tickFormatter={(value) => `$${value.toFixed(3)}`}
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const oraclePrice = payload.find(p => p.dataKey === "Oracle Price");
                    const dmmPrice = payload.find(p => p.dataKey === "DMM Price");
                    
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium mb-2">{label}</p>
                        {oraclePrice && (
                          <p className="text-sm text-blue-600">
                            Oracle: ${Number(oraclePrice.value).toFixed(6)}
                          </p>
                        )}
                        {dmmPrice && (
                          <p className="text-sm text-purple-600">
                            DMM: ${Number(dmmPrice.value).toFixed(6)}
                          </p>
                        )}
                        {oraclePrice && dmmPrice && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Diff: ${Math.abs(Number(oraclePrice.value) - Number(dmmPrice.value)).toFixed(6)}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Oracle Price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="DMM Price"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#7c3aed", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-blue-600"></div>
            <span className="text-muted-foreground">Oracle Feed (Official)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-purple-600"></div>
            <span className="text-muted-foreground">DMM Price (Market)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
