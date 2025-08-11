import React from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts";
import { format } from "date-fns";
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

  // Determine date span to format ticks accordingly
  const firstT = Number(data[0]?.t);
  const lastT = Number(data[data.length - 1]?.t);
  const spanDays = (lastT - firstT) / (1000 * 60 * 60 * 24);
  const dateTickFormat = spanDays <= 95 ? "MMM d" : spanDays <= 370 ? "MMM yyyy" : "yyyy";
  const tooltipDateFormat = spanDays <= 95 ? "PPpp" : spanDays <= 370 ? "PP" : "yyyy";

  return (
    <div className="trading-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-mono uppercase tracking-wider">Peg Stability</h3>
        <span className="text-xs font-mono text-muted-foreground">Deviation (%)</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ left: 10, right: 0, top: 10, bottom: 24 }}>
            <defs>
              <linearGradient id="pegGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <ReferenceArea y1={-0.1} y2={0.1} fill={`hsl(var(--ring) / 0.12)`} stroke={"none"} />
            <XAxis 
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v: number) => format(new Date(v), dateTickFormat)}
              minTickGap={28}
              label={{ value: "Date", position: "insideBottomRight", offset: -5, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              domain={[-0.2, 0.2]} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v: number) => `${v.toFixed(2)}%`}
              label={{ value: "Deviation (%)", angle: -90, position: "insideLeft", offset: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ stroke: `hsl(var(--ring) / 0.4)`, strokeWidth: 1 }}
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(v: number) => [`${v.toFixed(3)}%`, "Deviation"]}
              labelFormatter={(l) => format(new Date(Number(l)), tooltipDateFormat)}
            />
            <Area type="monotone" dataKey="dev" stroke={stroke} fill="url(#pegGradient)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
