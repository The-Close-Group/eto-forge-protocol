import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Settings, Bell, Plus, Wallet,
  Copy, Check, RefreshCw, FlaskConical
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
  DialogDescription,
} from "@/components/ui/dialog";

interface TopNavBarProps {
  onRefresh?: () => Promise<void>;
  onDeposit?: () => void;
  onSearch?: (query: string) => void;
}

export function TopNavBar({ onRefresh, onDeposit, onSearch }: TopNavBarProps) {
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

  const handleSearchSubmit = () => {
    if (onSearch && searchQuery) {
      onSearch(searchQuery);
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search for assets, transactions, and more</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets, transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 right-0 left-0 z-40 h-14 bg-background border-b border-border/50">
        <div className="h-full px-4 md:pl-[94px] md:pr-5 flex items-center justify-between">
          
          {/* Left Section - Paper Trading, Network & Wallet */}
          <div className="flex items-center gap-3">
            {/* Paper Trading Indicator */}
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
              <FlaskConical className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline text-[10px] sm:text-[11px] font-medium text-amber-500">Paper Trading</span>
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
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all group"
            >
              <Wallet className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-[11px] sm:text-[12px] font-mono text-foreground max-w-[80px] sm:max-w-none truncate">{shortAddress}</span>
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
              className="w-full max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 text-muted-foreground hover:text-foreground transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[12px] flex-1 text-left">Search assets, transactions...</span>
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 bg-background/50 rounded border border-border/30">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1.5">
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
            <div className="hidden sm:block w-px h-5 bg-border/50 mx-1" />

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
      </nav>
    </>
  );
}

export default TopNavBar;

