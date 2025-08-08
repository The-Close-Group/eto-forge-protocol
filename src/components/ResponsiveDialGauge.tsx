import React, { useEffect, useRef, useState } from "react";
import DialGauge from "@/components/ui/dial-gauge";

interface ResponsiveDialGaugeProps {
  value: number;
  label?: string;
  subLabel?: string;
  variant?: "full" | "semi";
  showTicks?: boolean;
  tickCount?: number;
  showNeedle?: boolean;
  className?: string;
  // Optional hard caps
  minSize?: number;
  maxSize?: number;
}

// A responsive wrapper that measures its container and sizes DialGauge accordingly
export default function ResponsiveDialGauge({
  value,
  label,
  subLabel,
  variant = "semi",
  showTicks = true,
  tickCount,
  showNeedle = true,
  className,
  minSize = 220,
  maxSize = 380,
}: ResponsiveDialGaugeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<number>(Math.min(Math.max(minSize, 280), maxSize));

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = entry.contentRect.width;
        // clamp and add a small padding to avoid tight edges
        const next = Math.max(minSize, Math.min(maxSize, Math.floor(cw)));
        setSize(next);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [minSize, maxSize]);

  // Thickness relative to size for consistent look
  const thickness = Math.max(10, Math.round(size * 0.05));

  return (
    <div ref={ref} className={className ?? "w-full max-w-[380px]"}>
      <DialGauge
        value={value}
        label={label}
        subLabel={subLabel}
        variant={variant}
        showTicks={showTicks}
        tickCount={tickCount}
        showNeedle={showNeedle}
        size={size}
        thickness={thickness}
      />
    </div>
  );
}
