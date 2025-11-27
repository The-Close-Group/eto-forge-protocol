import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { LucideIcon } from "lucide-react";
import {
  TrendingUp,
  LayoutDashboard,
  User,
  Layers,
  Coins,
  BarChart3,
  Shield,
  ArrowDownUp,
} from "lucide-react";

interface Item {
  title: string;
  url: string;
  icon: LucideIcon;
}

const items: Item[] = [
  { title: "Trade", url: "/trade", icon: TrendingUp },
  // { title: "Bridge", url: "/bridge", icon: ArrowDownUp }, // Temporarily removed
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "System Health", url: "/system-health", icon: Shield },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const groups = useMemo(() => [{ label: "Navigate", items }], []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup heading={group.label} key={group.label}>
            {group.items.map(({ url, title, icon: Icon }) => (
              <CommandItem
                key={url}
                value={`${title} ${url}`}
                onSelect={() => {
                  navigate(url);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
