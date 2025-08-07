import React from "react";
import { cn } from "@/lib/utils";

interface DialGaugeProps {
  value: number; // 0 - 100
  size?: number; // in px
  thickness?: number; // stroke width in px
  label?: string;
  subLabel?: string;
  className?: string;
}

// A reusable, accessible dial gauge for percentage metrics
export function DialGauge({
  value,
  size = 220,
  thickness = 14,
  label,
  subLabel,
  className,
}: DialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  // Color logic based on thresholds using semantic tokens
  const colorClass = clamped >= 99
    ? "text-data-positive"
    : clamped >= 95
    ? "text-warning"
    : "text-destructive";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Metric"} ${clamped.toFixed(1)} percent`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`hsl(var(--border))`}
          strokeOpacity={0.25}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className={cn(colorClass, "transition-[stroke-dashoffset] duration-700 ease-out")}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <div className={cn("font-mono text-5xl font-bold leading-none", colorClass)}>
          {clamped.toFixed(1)}%
        </div>
        {label && (
          <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-mono">
            {label}
          </div>
        )}
        {subLabel && (
          <div className="mt-1 text-[10px] uppercase tracking-wide text-accent-foreground/80 font-mono">
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default DialGauge;
