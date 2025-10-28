import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  icon?: string;
}

interface AssetDropdownProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  placeholder?: string;
}

export function AssetDropdown({
  assets,
  selectedAsset,
  onSelectAsset,
  placeholder = "Select asset"
}: AssetDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 bg-background border-border/60 hover:bg-accent/50"
        >
          {selectedAsset ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedAsset.symbol}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-card border-border shadow-md z-[200]" align="end">
        <Command>
          <CommandInput placeholder="Search assets..." className="h-9" />
          <CommandList>
            <CommandEmpty>No asset found.</CommandEmpty>
            <CommandGroup>
              {assets.map((asset) => (
                <CommandItem
                  key={asset.id}
                  value={asset.symbol}
                  onSelect={() => {
                    onSelectAsset(asset);
                    setOpen(false);
                  }}
                  className="hover:bg-accent/80"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-sm text-muted-foreground">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">{asset.balance.toFixed(2)}</div>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedAsset?.id === asset.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}