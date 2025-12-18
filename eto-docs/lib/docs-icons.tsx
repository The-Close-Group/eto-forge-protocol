import { createElement } from 'react';
import { icons, type LucideIcon } from 'lucide-react';

export const docsIconMap: Record<string, LucideIcon> = {
  overview: icons.LayoutGrid,
  'eto-global-markets': icons.Globe,
  'how-it-works': icons.Wrench,
  'for-builders': icons.Hammer,
  'what-is-eto': icons.Info,
  'maang-token': icons.Coins,
  philosophy: icons.Lightbulb,
  'market-roles': icons.Users,
  'buy-and-hold-assets': icons.Wallet,
  'stake-for-yield': icons.BadgeDollarSign,
  'provide-liquidity': icons.Droplets,
  'technical-architecture': icons.Network,
  'risk-and-security': icons.ShieldAlert,
};

export function resolveDocsIcon(icon?: string) {
  if (!icon) return undefined;

  const normalized = icon.toLowerCase();
  const Icon =
    docsIconMap[normalized] ??
    icons[icon as keyof typeof icons] ??
    icons[normalized as keyof typeof icons];

  return Icon ? createElement(Icon, { 'aria-hidden': true }) : undefined;
}

