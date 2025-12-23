import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolActivity } from "@/hooks/useProtocolActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, ChevronRight, RefreshCw, Zap, ExternalLink, Copy, Check,
  Search, Settings, Bell, Plus, Wallet, User, LogOut, Calculator, ChevronDown
} from "lucide-react";
import { AssetCard } from "@/components/AssetCard";
import maangLogo from "@/assets/maang-logo.svg";
import a16zLogo from "@/assets/a16z-logo.svg";
import ycLogo from "@/assets/ycombinator-logo.svg";
import sequoiaLogo from "@/assets/sequoia-logo.svg";
import lightspeedLogo from "@/assets/lightspeed-logo.svg";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";

// Asset data for staking cards (original Dashboard style)
const stakingAssets = [
  {
    id: 'maang',
    name: 'MAANG',
    symbol: 'MAANG',
    type: 'defi',
    logo: maangLogo,
    color: '#10b981',
    rewardRate: 1.51,
    riskLevel: 'low' as const,
    tvl: 850000,
  },
  {
    id: 'smaang',
    name: 'Staked MAANG',
    symbol: 'sMAANG',
    type: 'liquid',
    logo: maangLogo,
    color: '#8b5cf6',
    rewardRate: 1.51,
    riskLevel: 'low' as const,
    tvl: 420000,
  },
  // NOTE: USDC card hidden - see src/components/_scrap/hidden-assets.ts
  // Thematic Index Cards
  {
    id: 'ycombinator',
    name: 'Y Combinator',
    symbol: 'YC',
    type: 'index',
    logo: ycLogo,
    color: '#E87136',
    rewardRate: 2.34,
    riskLevel: 'medium' as const,
    tvl: 2500000,
  },
  {
    id: 'sequoia',
    name: 'Sequoia Capital',
    symbol: 'SEQ',
    type: 'index',
    logo: sequoiaLogo,
    color: '#00713A',
    rewardRate: 2.18,
    riskLevel: 'medium' as const,
    tvl: 3200000,
  },
  {
    id: 'lightspeed',
    name: 'Lightspeed',
    symbol: 'LSVP',
    type: 'index',
    logo: lightspeedLogo,
    color: '#DE7564',
    rewardRate: 1.95,
    riskLevel: 'medium' as const,
    tvl: 1800000,
  },
  {
    id: 'a16z',
    name: 'a16z',
    symbol: 'A16Z',
    type: 'index',
    logo: a16zLogo,
    color: '#5E1D23',
    rewardRate: 2.45,
    riskLevel: 'medium' as const,
    tvl: 4100000,
  },
];

export default function Trade() {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const { signOut } = useAuth();
  const { dmmPrice, oraclePrice, isLoading } = useDeFiPrices();
  const { setOpen } = useSidebar();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investmentPeriod, setInvestmentPeriod] = useState(6);
  const [addressCopied, setAddressCopied] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState<Array<{ id: number; title: string; message: string; time: string; read: boolean }>>([]);
  
  // Wallet address formatting
  const displayAddress = account?.address || "0x44A5...50B3";
  const shortAddress = displayAddress.length > 10 
    ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
    : displayAddress;
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const { data: protocolStats, isLoading: isLoadingProtocol, refetch: refetchStats } = useProtocolStats();
  const { data: protocolActivity, isLoading: isLoadingActivity, refetch: refetchActivity } = useProtocolActivity();

  const sliderPosition = ((investmentPeriod - 1) / 11) * 100;

  // Close sidebar when component mounts
  useEffect(() => {
    setOpen(false);
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [setOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchActivity()]);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(displayAddress);
    setAddressCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleMarkAllRead = () => {
    toast.success("All notifications marked as read");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
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
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {stakingAssets
                .filter(a => 
                  a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(asset => (
                  <button
                    key={asset.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      navigate(`/execute/${asset.id}`);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden" style={{ background: `${asset.color}20` }}>
                      <img src={asset.logo} alt="" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{asset.name}</div>
                      <div className="text-[11px] text-muted-foreground">{asset.symbol}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Navigation Bar - Same as Dashboard */}
      <nav className="fixed top-0 right-0 left-0 md:left-[60px] z-40 h-14 bg-background border-b border-border/50">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          
          {/* Left Section - Network & Wallet */}
          <div className="flex items-center gap-3">
            {/* Network Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border/40">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[11px] font-medium text-foreground">ETO L1</span>
            </div>

            {/* Wallet Address */}
            <button 
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/50 transition-all group"
            >
              <Wallet className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-[12px] font-mono text-foreground">{shortAddress}</span>
              {addressCopied ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
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

          {/* Right Section - Actions & Account */}
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
            <div className="hidden sm:block w-px h-5 bg-border/40 mx-2" />

            {/* Deposit Button */}
            <button 
              onClick={() => navigate('/staking')}
              className="hidden sm:flex h-8 px-3 items-center gap-1.5 rounded-md text-[12px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>

            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                    RC
                  </div>
                  <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Account Header */}
                <div className="px-3 py-2.5 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-semibold text-primary-foreground">
                      RC
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">Ryan Crawford</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{shortAddress}</div>
                    </div>
                  </div>
                </div>
                
                {/* Wallet Balance Preview */}
                <div className="px-3 py-2 border-b border-border/50 bg-muted/20">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Portfolio Value</div>
                  <div className="text-[14px] font-semibold">$41,812.14</div>
                </div>

                <DropdownMenuItem onClick={() => navigate('/profile')} className="py-2">
                  <User className="w-4 h-4 mr-2.5 text-muted-foreground" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/staking')} className="py-2">
                  <Wallet className="w-4 h-4 mr-2.5 text-muted-foreground" />
                  My Positions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info("Coming soon")} className="py-2">
                  <Calculator className="w-4 h-4 mr-2.5 text-muted-foreground" />
                  Calculator
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyAddress} className="py-2">
                  {addressCopied ? (
                    <Check className="w-4 h-4 mr-2.5 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2.5 text-muted-foreground" />
                  )}
                  {addressCopied ? 'Copied!' : 'Copy Address'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`https://eto-explorer.ash.center/address/${displayAddress}`, '_blank')} className="py-2">
                  <ExternalLink className="w-4 h-4 mr-2.5 text-muted-foreground" />
                  View on Explorer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="py-2 text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Page Content - offset for fixed navbar */}
      <div className="pt-14">
        {/* Page Header - Upper Left Corner */}
        <div className="px-6 md:px-8 pt-6 md:pt-8">
        <div 
          className={`mb-8 transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Assets
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">ETO L1</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Trade and stake native L1 assets on the ETO Dynamic Market Maker
          </p>
        </div>
        </div>

      {/* Asset Cards Grid - 3 columns on lg */}
        <div 
        className={`px-6 md:px-8 mb-6 transition-all duration-700 delay-100 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
          }`}
        >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stakingAssets.map((asset, index) => (
            <div
              key={asset.id}
              style={{ 
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease-out ${index * 50}ms`,
              }}
            >
              <AssetCard
                id={asset.id}
                name={asset.name}
                symbol={asset.symbol}
                type={asset.type}
                logo={asset.logo}
                color={asset.color}
                rewardRate={asset.rewardRate}
                riskLevel={asset.riskLevel}
                tvl={asset.tvl}
                isSelected={hoveredCard === asset.id}
                onClick={() => setHoveredCard(asset.id)}
                onDoubleClick={() => navigate(`/execute/${asset.id}`)}
              />
            </div>
          ))}
        </div>
        </div>

      {/* Content Container with padding */}
      <div className="px-6 md:px-8 pb-6 md:pb-8">
        {/* Secondary Cards Grid */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 transition-all duration-700 delay-150 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Investment Period */}
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[14px] font-medium">Investment Period</h3>
                <span className="period-badge-active">{investmentPeriod} Month{investmentPeriod > 1 ? 's' : ''}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-5">Contribution Period</p>
              
              <div className="flex gap-2 flex-wrap mb-4">
                {[1, 3, 6, 12].map(months => (
                  <button
                    key={months}
                    className={months === investmentPeriod ? 'period-badge-active' : 'period-badge'}
                    onClick={() => setInvestmentPeriod(months)}
                  >
                    {months}M
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(parseInt(e.target.value))}
                  className="w-full h-[3px] bg-muted rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                    [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary
                    [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(160 70% 50%) 0%, hsl(160 70% 50%) ${sliderPosition}%, hsl(var(--muted)) ${sliderPosition}%, hsl(var(--muted)) 100%)`
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Protocol Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px] flex items-center justify-between">
                Protocol Stats
                <button className={`${isRefreshing ? 'animate-spin' : ''}`} onClick={handleRefresh}>
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">Total Value Locked</span>
                <span className="text-[13px] font-medium">
                  {isLoadingProtocol ? <Skeleton className="h-4 w-16" /> : 
                    `$${(protocolStats?.tvl || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">Oracle Price</span>
                <span className="text-[13px] font-medium">
                  {isLoading ? <Skeleton className="h-4 w-16" /> : `$${oraclePrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">DMM Price</span>
                <span className="text-[13px] font-medium">
                  {isLoading ? <Skeleton className="h-4 w-16" /> : `$${dmmPrice.toFixed(2)}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                <Link to="/buy-maang">
                  <span className="text-[13px]">Buy MAANG</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                <Link to="/staking">
                  <span className="text-[13px]">Stake Assets</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-between h-9 px-3">
                <Link to="/faucet">
                  <span className="text-[13px]">Get mUSDC</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Protocol Activity */}
        <div 
          className={`transition-all duration-700 delay-200 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-6'
          }`}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-[15px]">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Protocol Activity
                </div>
                <button 
                  className={`text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 ${isRefreshing ? 'animate-spin' : ''}`}
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {isLoadingActivity ? (
                  <>
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </>
                ) : protocolActivity && protocolActivity.length > 0 ? (
                  protocolActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium ${
                          activity.type === 'drip_execute' ? 'bg-data-positive/10 text-data-positive' :
                          activity.type === 'drip_commit' ? 'bg-primary/10 text-primary' :
                          activity.type === 'deposit' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {activity.type === 'drip_execute' ? '⚡' :
                           activity.type === 'drip_commit' ? '📝' :
                           activity.type === 'deposit' ? '+' : '?'}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium">{activity.description}</div>
                          {activity.amount && (
                            <div className="text-[11px] text-muted-foreground">{activity.amount}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="text-[11px] text-muted-foreground">{activity.timeAgo}</div>
                          <div className="text-[10px] text-muted-foreground">Block #{activity.blockNumber}</div>
                        </div>
                        {activity.txHash && (
                          <a 
                            href={`https://eto-explorer.ash.center/tx/${activity.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn p-1.5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-10 text-[13px]">
                    No recent protocol activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
