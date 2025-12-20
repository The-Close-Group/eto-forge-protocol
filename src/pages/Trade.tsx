import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { useProtocolStats } from "@/hooks/useProtocolStats";
import { useProtocolActivity } from "@/hooks/useProtocolActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Sparkles, ChevronRight, RefreshCw, Zap, ExternalLink } from "lucide-react";
import { AssetCard } from "@/components/AssetCard";
import maangLogo from "@/assets/maang-logo.svg";

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
    type: 'defi',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: '#2775ca',
    rewardRate: 1.51,
    riskLevel: 'low' as const,
    tvl: 1200000,
  },
];

export default function Trade() {
  const navigate = useNavigate();
  const { dmmPrice, oraclePrice, isLoading } = useDeFiPrices();
  const { setOpen } = useSidebar();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [investmentPeriod, setInvestmentPeriod] = useState(6);
  
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

  return (
    <div className="min-h-screen p-6 md:p-8 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Page Header - Animated */}
        <div 
          className={`text-center mb-12 transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">ETO L1 Native Assets</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
            Token{" "}
            <span className="text-muted-foreground/40">Trading Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Trade and stake native L1 assets on the ETO Dynamic Market Maker
          </p>
        </div>

        {/* Asset Cards Grid - Dashboard Style */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 transition-all duration-700 delay-150 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-12'
          }`}
        >
          {stakingAssets.map((asset, index) => (
            <div
              key={asset.id}
              style={{ 
                transitionDelay: `${index * 75}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
              className="transition-all duration-500 ease-out"
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
                onDoubleClick={() => {
                  if (asset.id === 'maang') navigate('/buy-maang');
                  else if (asset.id === 'smaang') navigate('/staking');
                  else navigate('/faucet');
                }}
              />
            </div>
          ))}
        </div>

        {/* Secondary Cards Grid */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-200 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
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
          className={`transition-all duration-700 delay-300 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
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
