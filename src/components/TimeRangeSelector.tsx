import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "3Y" | "5Y" | "ALL";

interface TimeRangeSelectorProps {
  value: RangeKey;
  onChange: (value: RangeKey) => void;
  className?: string;
}

export default function TimeRangeSelector({ value, onChange, className }: TimeRangeSelectorProps) {
  const ranges: RangeKey[] = ["1M", "3M", "6M", "YTD", "1Y", "3Y", "5Y", "ALL"];

  return (
    <div className={className}>
      <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as RangeKey)}>
        {ranges.map((r) => (
          <ToggleGroupItem key={r} value={r} aria-label={`Select ${r}`}>
            <span className="font-mono text-xs">{r}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
