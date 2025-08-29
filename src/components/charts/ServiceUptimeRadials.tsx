import React from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

interface ServiceItem {
  name: string;
  uptime: number; // percentage 0..100
  color?: string; // hsl color string
}

interface ServiceUptimeRadialsProps {
  data: ServiceItem[];
}

export default function ServiceUptimeRadials({ data }: ServiceUptimeRadialsProps) {
  if (!data?.length) return null;

  const colorFor = (v: number) => {
    if (v >= 99) return `hsl(var(--data-positive))`;
    if (v >= 95) return `hsl(var(--warning))`;
    return `hsl(var(--destructive))`;
  };

  return (
    <div className="trading-panel p-6">
      <h3 className="text-base font-semibold mb-4">Service Uptime</h3>
      <div className="grid grid-cols-2 gap-4">
        {data.map((s, idx) => (
          <div key={idx} className="relative h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={[{ name: s.name, value: s.uptime }]}
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill={colorFor(s.uptime)}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-mono font-bold">{s.uptime.toFixed(2)}%</span>
              <span className="text-xs text-muted-foreground text-center px-2">{s.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
