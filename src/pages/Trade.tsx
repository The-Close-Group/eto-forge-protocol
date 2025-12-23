import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolActivity } from "@/hooks/useProtocolActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ChevronRight, ChevronLeft, RefreshCw, Zap, ExternalLink } from "lucide-react";
import { AssetCard } from "@/components/AssetCard";
import maangLogo from "@/assets/maang-logo.svg";
import a16zLogo from "@/assets/a16z-logo.svg";
import ycLogo from "@/assets/ycombinator-logo.svg";
import sequoiaLogo from "@/assets/sequoia-logo.svg";
import lightspeedLogo from "@/assets/lightspeed-logo.svg";

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
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    type: 'stablecoin',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: '#2775ca',
    rewardRate: 1.51,
    riskLevel: 'low' as const,
    tvl: 1200000,
  },
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

// Duplicate assets for seamless infinite scroll
const infiniteAssets = [...stakingAssets, ...stakingAssets];

export default function Trade() {
  const navigate = useNavigate();
  const { dmmPrice, oraclePrice, isLoading } = useDeFiPrices();
  const { setOpen } = useSidebar();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investmentPeriod, setInvestmentPeriod] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: protocolStats, isLoading: isLoadingProtocol, refetch: refetchStats } = useProtocolStats();
  const { data: protocolActivity, isLoading: isLoadingActivity, refetch: refetchActivity } = useProtocolActivity();

  const sliderPosition = ((investmentPeriod - 1) / 11) * 100;

  // Manual scroll function for arrow buttons
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background overflow-hidden">
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

      {/* Asset Cards Carousel - Infinite with Manual Scroll */}
      <div 
        className={`relative mb-8 transition-all duration-700 delay-100 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Left Arrow */}
        <button
          onClick={() => { setIsPaused(true); scrollCarousel('left'); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm border border-border-subtle shadow-lg flex items-center justify-center transition-all hover:bg-muted hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => { setIsPaused(true); scrollCarousel('right'); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/95 backdrop-blur-sm border border-border-subtle shadow-lg flex items-center justify-center transition-all hover:bg-muted hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Carousel Track - CSS Animation */}
          <div 
            className="flex gap-4 py-2 pl-14 pr-14"
            style={{
              animation: isPaused ? 'none' : 'carousel-scroll 50s linear infinite',
              width: 'fit-content',
            }}
          >
            {infiniteAssets.map((asset, index) => (
              <div
                key={`${asset.id}-${index}`}
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease-out ${Math.min(index, 6) * 50}ms`,
                }}
                className="flex-shrink-0 w-[340px] lg:w-[380px]"
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

        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
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
  );
}
