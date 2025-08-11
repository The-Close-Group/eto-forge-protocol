import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface ReserveSlice {
  name: string;
  value: number;
  color?: string;
}

interface ReservesDonutProps {
  data: ReserveSlice[];
}

export default function ReservesDonut({ data }: ReservesDonutProps) {
  if (!data?.length) return null;

  const colors = [
    `hsl(var(--primary))`,
    `hsl(var(--accent))`,
    `hsl(var(--ring))`,
    `hsl(var(--muted-foreground))`,
  ];

  return (
    <div className="trading-panel p-4">
      <h3 className="text-sm font-mono uppercase tracking-wider mb-2">Reserves Composition</h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((s, i) => (
                <Cell key={`c-${i}`} fill={s.color || colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
