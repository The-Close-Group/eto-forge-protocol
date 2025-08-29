import React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    portfolioValue: number;
    cumulativeReturn: number;
  }>;
  height?: number;
}

export default function PerformanceChart({ data, height = 300 }: PerformanceChartProps) {
  const chartConfig = {
    portfolioValue: {
      label: "Portfolio Value",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Portfolio Value"]}
              labelFormatter={(label: any) => new Date(label).toLocaleDateString()}
            />} 
          />
          <Line
            type="monotone"
            dataKey="portfolioValue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}