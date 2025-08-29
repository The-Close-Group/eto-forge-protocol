import React from "react";
import { cn } from "@/lib/utils";

interface DialGaugeProps {
  value: number; // 0 - 100
  size?: number; // in px
  thickness?: number; // stroke width in px
  label?: string;
  subLabel?: string;
  className?: string;
  variant?: "full" | "semi"; // full circle or semicircle
  showTicks?: boolean;
  tickCount?: number; // number of ticks along the arc
  showNeedle?: boolean;
}

// Polar helpers for arc path
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

// A reusable, accessible dial gauge for percentage metrics
export function DialGauge({
  value,
  size = 220,
  thickness = 14,
  label,
  subLabel,
  className,
  variant = "full",
  showTicks = true,
  tickCount = 21,
  showNeedle = false,
}: DialGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));

  // Color logic based on thresholds using semantic tokens
  const colorClass = clamped >= 99
    ? "text-data-positive"
    : clamped >= 95
    ? "text-warning"
    : "text-destructive";

  // Common values
  const center = size / 2;
  const radius = (size - thickness) / 2;

  // Semi-arc angles with slight padding for aesthetics
  const startAngle = 180 + 6;
  const endAngle = 360 - 6;
  const span = endAngle - startAngle; // ~168deg

  // Map value 0-100 to angle along the semi arc
  const valueAngle = startAngle + (clamped / 100) * span;

  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  const isSemi = variant === "semi";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: isSemi ? size * 0.7 : size }}
      role="img"
      aria-label={`${label ?? "Metric"} ${clamped.toFixed(1)} percent`}
    >
      <svg
        width={size}
        height={isSemi ? size * 0.7 : size}
        viewBox={`0 0 ${size} ${isSemi ? size * 0.7 : size}`}
        preserveAspectRatio="xMidYMid meet"
        className="block"
      >
        {isSemi ? (
          <g>
            {/* Track arc */}
            <path
              d={describeArc(center, isSemi ? size * 0.7 - 10 : center, radius, startAngle, endAngle)}
              fill="none"
              stroke={`hsl(var(--border))`}
              strokeOpacity={0.25}
              strokeWidth={thickness}
              strokeLinecap="round"
            />

            {/* Value arc */}
            <path
              d={describeArc(center, isSemi ? size * 0.7 - 10 : center, radius, startAngle, valueAngle)}
              fill="none"
              stroke="currentColor"
              className={cn(colorClass, "transition-all duration-500 ease-out")}
              strokeWidth={thickness}
              strokeLinecap="round"
            />

            {/* Ticks */}
            {showTicks && (
              <g>
                {Array.from({ length: tickCount }).map((_, i) => {
                  const t = i / (tickCount - 1);
                  const angle = startAngle + t * span;
                  const outer = polarToCartesian(center, isSemi ? size * 0.7 - 10 : center, radius + thickness * 0.1, angle);
                  const inner = polarToCartesian(center, isSemi ? size * 0.7 - 10 : center, radius - thickness * 0.6, angle);
                  const active = angle <= valueAngle;
                  return (
                    <line
                      key={i}
                      x1={inner.x}
                      y1={inner.y}
                      x2={outer.x}
                      y2={outer.y}
                      stroke={active ? "currentColor" : `hsl(var(--border))`}
                      className={active ? colorClass : undefined}
                      strokeWidth={active ? 2 : 1}
                      strokeOpacity={active ? 1 : 0.35}
                    />
                  );
                })}
              </g>
            )}

            {/* Needle */}
            {showNeedle && (
              <g className="transition-transform duration-500 ease-out">
                {(() => {
                  const p = polarToCartesian(center, isSemi ? size * 0.7 - 10 : center, radius - thickness * 0.1, valueAngle);
                  return (
                    <g>
                      <circle cx={center} cy={isSemi ? size * 0.7 - 10 : center} r={thickness * 0.45} fill={`hsl(var(--muted))`} />
                      <line
                        x1={center}
                        y1={isSemi ? size * 0.7 - 10 : center}
                        x2={p.x}
                        y2={p.y}
                        className={colorClass}
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })()}
              </g>
            )}
          </g>
        ) : (
          // Full circle variant
          <g>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={`hsl(var(--border))`}
              strokeOpacity={0.25}
              strokeWidth={thickness}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className={cn(colorClass, "transition-[stroke-dashoffset] duration-500 ease-out")}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * radius}
              strokeDashoffset={(2 * Math.PI * radius) * (1 - clamped / 100)}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </g>
        )}
      </svg>

      <div className={cn("absolute inset-0 flex flex-col items-center justify-center select-none", isSemi && "justify-end pb-2")}
      >
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
