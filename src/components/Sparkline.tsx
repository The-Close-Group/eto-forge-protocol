import React from "react";

interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
  colorVar?: string; // CSS variable name like --ring, --primary, etc.
}

export default function Sparkline({ data, height = 48, className, colorVar = "--ring" }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100; // 0..100
      const y = (1 - (v - min) / range) * 100; // invert so higher values are higher visually
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={`hsl(var(${colorVar}))`}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
