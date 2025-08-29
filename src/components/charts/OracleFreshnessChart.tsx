import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface FreshnessItem {
  asset: string;
  seconds: number;
}

interface OracleFreshnessChartProps {
  data: FreshnessItem[];
  height?: number;
}

export default function OracleFreshnessChart({ data, height = 260 }: OracleFreshnessChartProps) {
  if (!data?.length) return null;

  const colorFor = (s: number) => {
    if (s <= 5) return `hsl(var(--data-positive))`;
    if (s <= 10) return `hsl(var(--warning))`;
    return `hsl(var(--destructive))`;
  };

  return (
    <div className="trading-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Oracle Freshness</h3>
        <span className="text-sm text-muted-foreground">Seconds since last update</span>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 12, right: 12, top: 10, bottom: 4 }}>
            <XAxis type="number" hide domain={[0, 'dataMax + 5']} />
            <YAxis type="category" dataKey="asset" width={60} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: `hsl(var(--ring) / 0.08)` }}
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(v: number) => [`${v.toFixed(1)}s`, "Freshness"]}
            />
            <Bar dataKey="seconds" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => (
                <Cell key={`cell-${i}`} fill={colorFor(d.seconds)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
