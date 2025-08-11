import React from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";

interface PegPoint {
  t: string | number;
  dev: number; // deviation in percent (e.g., 0.05 for 0.05%)
}

interface PegStabilityChartProps {
  data: PegPoint[];
  height?: number;
}

export default function PegStabilityChart({ data, height = 220 }: PegStabilityChartProps) {
  if (!data?.length) return null;

  const stroke = `hsl(var(--data-positive))`;
  const fill = `hsl(var(--data-positive) / 0.15)`;

  return (
    <div className="trading-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-mono uppercase tracking-wider">Peg Stability</h3>
        <span className="text-xs font-mono text-muted-foreground">Deviation (%)</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="pegGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <ReferenceArea y1={-0.1} y2={0.1} fill={`hsl(var(--ring) / 0.12)`} stroke={"none"} />
            <XAxis dataKey="t" hide tickLine={false} axisLine={false} />
            <YAxis hide domain={[-0.2, 0.2]} />
            <Tooltip
              cursor={{ stroke: `hsl(var(--ring) / 0.4)`, strokeWidth: 1 }}
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(v: number) => [`${v.toFixed(3)}%`, "Deviation"]}
              labelFormatter={(l) => `t=${l}`}
            />
            <Area type="monotone" dataKey="dev" stroke={stroke} fill="url(#pegGradient)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
