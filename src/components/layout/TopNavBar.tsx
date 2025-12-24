import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Settings, Bell, Plus, Wallet,
  Copy, Check, RefreshCw, FlaskConical, TrendingUp, ArrowRight
} from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import maangLogo from "@/assets/maang-logo.svg";
import a16zLogo from "@/assets/a16z-logo.svg";
import ycLogo from "@/assets/ycombinator-logo.svg";
import sequoiaLogo from "@/assets/sequoia-logo.svg";
import lightspeedLogo from "@/assets/lightspeed-logo.svg";

// Searchable assets - all available trading assets
const SEARCHABLE_ASSETS = [
  {
    id: 'maang',
    symbol: 'MAANG',
    name: 'MAANG Token',
    description: 'ETO Protocol native token',
    logo: maangLogo,
    price: 12.50,
    change: 4.6,
    category: 'protocol',
  },
  {
    id: 'smaang',
    symbol: 'sMAANG',
    name: 'Staked MAANG',
    description: 'Liquid staking derivative',
    logo: maangLogo,
    price: 13.25,
    change: 3.2,
    category: 'protocol',
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    description: 'Stablecoin pegged to USD',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    price: 1.00,
    change: 0.0,
    category: 'stablecoin',
  },
  {
    id: 'ycombinator',
    symbol: 'YC',
    name: 'Y Combinator Index',
    description: 'YC portfolio companies index',
    logo: ycLogo,
    price: 145.80,
    change: 2.34,
    category: 'index',
  },
  {
    id: 'sequoia',
    symbol: 'SEQ',
    name: 'Sequoia Capital Index',
    description: 'Sequoia portfolio index',
    logo: sequoiaLogo,
    price: 238.50,
    change: 2.18,
    category: 'index',
  },
  {
    id: 'lightspeed',
    symbol: 'LSVP',
    name: 'Lightspeed Index',
    description: 'Lightspeed Ventures portfolio',
    logo: lightspeedLogo,
    price: 98.25,
    change: 1.95,
    category: 'index',
  },
  {
    id: 'a16z',
    symbol: 'A16Z',
    name: 'a16z Index',
    description: 'Andreessen Horowitz portfolio',
    logo: a16zLogo,
    price: 312.40,
    change: 3.15,
    category: 'index',
  },
];

interface TopNavBarProps {
  onRefresh?: () => Promise<void>;
  onDeposit?: () => void;
}

export function TopNavBar({ onRefresh, onDeposit }: TopNavBarProps) {
  const navigate = useNavigate();
  const account = useActiveAccount();
  
  const [addressCopied, setAddressCopied] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications] = useState<Array<{ id: number; title: string; message: string; time: string; read: boolean }>>([]);

  // Wallet address formatting
  const displayAddress = account?.address || "0x44A5...50B3";
  const shortAddress = displayAddress.length > 10 
    ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
    : displayAddress;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter assets based on search query
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return SEARCHABLE_ASSETS;
    const query = searchQuery.toLowerCase();
    return SEARCHABLE_ASSETS.filter(asset => 
      asset.symbol.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query) ||
      asset.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(displayAddress);
    setAddressCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleDeposit = () => {
    if (onDeposit) {
      onDeposit();
    } else {
      navigate('/staking');
    }
  };

  const handleMarkAllRead = () => {
    toast.success("All notifications marked as read");
  };

  const handleAssetClick = (assetId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/execute/${assetId}`);
  };

  // Keyboard shortcut for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) setSearchQuery('');
      }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden" onKeyDown={handleKeyDown}>
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-[15px]">Search Assets</DialogTitle>
          </DialogHeader>
          
          {/* Search Input */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/30 border-border/50"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="border-t border-border/50 max-h-[320px] overflow-y-auto">
            {filteredAssets.length > 0 ? (
              <div className="p-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                  Assets
                </div>
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleAssetClick(asset.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium">{asset.symbol}</span>
                        <span className="text-[11px] text-muted-foreground">{asset.name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{asset.description}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[13px] font-medium">${asset.price.toFixed(2)}</div>
                      <div className={`text-[11px] flex items-center justify-end gap-0.5 ${asset.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No assets found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="border-t border-border/50 p-3 bg-muted/20">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Click an asset to trade</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">↵</kbd>
                <span>to select</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono ml-2">esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Navigation Bar - Full width, content offset for sidebar */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-background border-b border-border/50">
        <div className="h-full flex items-center">
          {/* Spacer for sidebar */}
          <div className="hidden md:block w-[90px] flex-shrink-0" />
          
          {/* Nav Content */}
          <div className="flex-1 h-full px-3 md:px-4 flex items-center justify-between">
            {/* Left Section - Paper Trading, Network & Wallet */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Paper Trading Indicator */}
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                <FlaskConical className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline text-[10px] font-medium text-amber-500">Paper Trading</span>
                <span className="sm:hidden text-[10px] font-medium text-amber-500">Paper</span>
              </div>

              {/* Network Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border/40">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-medium text-foreground">ETO L1</span>
              </div>

              {/* Wallet Address */}
              <button 
                onClick={handleCopyAddress}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all group"
              >
                <Wallet className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[11px] font-mono text-foreground max-w-[80px] sm:max-w-none truncate">{shortAddress}</span>
                {addressCopied ? (
                  <Check className="w-3 h-3 text-primary flex-shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
              <button 
                onClick={() => setSearchOpen(true)}
                className="w-full max-w-sm flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-[12px] flex-1 text-left">Search assets, transactions...</span>
                <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-background/50 rounded border border-border/30">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile Search */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="md:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                    <span className="text-[12px] font-medium">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="text-[11px] text-primary hover:underline" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="py-6 text-center">
                    <Bell className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1.5" />
                    <p className="text-[11px] text-muted-foreground">No notifications</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh */}
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                    Appearance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Coming soon")}>
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/system-health')}>
                    System Health
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-border/50 mx-1.5" />

              {/* Deposit Button */}
              <button 
                onClick={handleDeposit}
                className="hidden sm:flex h-8 px-3.5 items-center gap-1.5 rounded-md text-[12px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default TopNavBar;
