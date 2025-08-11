import React from "react";
import usdcLogo from "@/assets/usdc-logo.png";
import avaxLogo from "@/assets/avalanche-logo.png";
import solLogo from "@/assets/solana-logo.png";
import lzLogo from "@/assets/layerzero-logo.png";

interface CoinIconProps {
  symbol: string;
  size?: number; // in px
  className?: string;
  alt?: string;
}

const SYMBOL_TO_LOGO: Record<string, string> = {
  USDC: usdcLogo,
  USDT: usdcLogo, // fallback to USDC style if no dedicated icon
  AVAX: avaxLogo,
  SOL: solLogo,
  LZ: lzLogo,
  LAYERZERO: lzLogo,
};

export default function CoinIcon({ symbol, size = 18, className = "", alt }: CoinIconProps) {
  const key = symbol?.toUpperCase?.() || symbol;
  const src = SYMBOL_TO_LOGO[key];

  if (src) {
    return (
      <img
        src={src}
        alt={alt || `${key} logo`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`inline-block rounded-full shadow-sm ring-1 ring-border/40 ${className}`}
        style={{ objectFit: "contain" }}
      />
    );
  }

  // Elegant fallback badge with initials
  const initials = (key || "?").slice(0, 3).toUpperCase();
  return (
    <span
      aria-label={`${key} logo`}
      className={`inline-flex items-center justify-center rounded-full bg-muted text-foreground/90 ring-1 ring-border/40 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.45) }}
    >
      {initials}
    </span>
  );
}
