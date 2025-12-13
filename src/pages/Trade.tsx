import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Zap, Shield, Coins, Sparkles } from "lucide-react";
import Sparkline, { generateSparklineData } from "@/components/Sparkline";
import maangLogo from "@/assets/maang-logo.svg";

// Asset data for L1 native tokens
const assets = [
  {
    id: 'maang',
    name: 'MAANG',
    symbol: 'MAANG',
    description: 'Dynamic Reflective Index Token',
    logo: maangLogo,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'hover:border-emerald-500/50',
    accentColor: 'text-emerald-400',
    trend: 'up' as const,
  },
  {
    id: 'smaang',
    name: 'Staked MAANG',
    symbol: 'sMAANG',
    description: 'Yield-bearing MAANG Receipt',
    logo: maangLogo,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'hover:border-violet-500/50',
    accentColor: 'text-violet-400',
    trend: 'up' as const,
  },
  {
    id: 'musdc',
    name: 'Mock USDC',
    symbol: 'mUSDC',
    description: 'Paper Trading Stablecoin',
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'hover:border-blue-500/50',
    accentColor: 'text-blue-400',
    trend: 'flat' as const,
    isStable: true,
  },
];

export default function Trade() {
  const navigate = useNavigate();
  const { dmmPrice, oraclePrice, isLoading } = useDeFiPrices();
  const { setOpen } = useSidebar();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Close sidebar when component mounts
  useEffect(() => {
    setOpen(false);
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [setOpen]);

  // Use DMM price as the live trading price
  const livePrice = dmmPrice || oraclePrice || 1;
  const priceSource = dmmPrice > 0 ? 'DMM' : oraclePrice > 0 ? 'Oracle' : 'N/A';

  // NOTE: sMAANG price should come from vault share price, using same as MAANG for now
  const smaangPrice = livePrice;

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

        {/* Asset Cards Grid */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-700 delay-150 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-12'
          }`}
        >
          {assets.map((asset, index) => (
            <Card 
              key={asset.id}
              className={`relative overflow-hidden transition-all duration-500 ease-out cursor-pointer group
                ${asset.borderColor}
                ${hoveredCard === asset.id ? 'scale-[1.02] shadow-xl shadow-black/20' : 'scale-100'}
              `}
              style={{ 
                transitionDelay: `${index * 75}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              }}
              onMouseEnter={() => setHoveredCard(asset.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${asset.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${asset.color} flex items-center justify-center p-2 
                      transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <img 
                        src={asset.logo || asset.logoUrl} 
                        alt={asset.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold font-mono">{asset.symbol}</h3>
                      <p className="text-xs text-muted-foreground">{asset.description}</p>
                    </div>
                  </div>
                  
                  {!asset.isStable && (
                    <Badge variant="outline" className={`${asset.accentColor} border-current/30`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      —%
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className={`text-3xl font-bold font-mono ${asset.accentColor} transition-all duration-300 
                    group-hover:scale-105 group-hover:translate-x-1`}
                  >
                    {isLoading && !asset.isStable ? (
                      <Skeleton className="h-9 w-28" />
                    ) : asset.isStable ? (
                      '$1.00'
                    ) : asset.id === 'smaang' ? (
                      `$${smaangPrice.toFixed(2)}`
                    ) : (
                      `$${livePrice.toFixed(2)}`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {asset.isStable ? 'Pegged to USD' : `Live from ${priceSource}`}
                    </Badge>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="h-12 mb-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkline 
                    data={generateSparklineData(24, asset.trend)} 
                    height={48}
                    variant={asset.trend === 'up' ? 'positive' : 'default'}
                    showArea={true}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {asset.id === 'maang' && (
                    <>
                      <Button 
                        variant="cta" 
                        size="lg" 
                        className="w-full group/btn"
                        onClick={() => navigate('/buy-maang')}
                      >
                        <span>Buy MAANG</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/buy-maang')}
                      >
                        Sell MAANG
                      </Button>
                    </>
                  )}
                  
                  {asset.id === 'smaang' && (
                    <>
                      <Button 
                        variant="cta" 
                        size="lg" 
                        className="w-full group/btn"
                        onClick={() => navigate('/staking')}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        <span>Stake MAANG</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/staking')}
                      >
                        Unstake & Redeem
                      </Button>
                    </>
                  )}
                  
                  {asset.id === 'musdc' && (
                    <>
                      <Button 
                        variant="cta" 
                        size="lg" 
                        className="w-full group/btn"
                        onClick={() => navigate('/buy-maang')}
                      >
                        <span>Swap to MAANG</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/faucet')}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Get mUSDC (Faucet)
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats Bar - Animated */}
        <div 
          className={`transition-all duration-700 delay-300 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center md:text-left">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-center md:justify-start">
                    <Shield className="w-3 h-3" />
                    Oracle Price
                  </div>
                  <div className="text-lg font-mono font-semibold">
                    {isLoading ? <Skeleton className="h-6 w-20 mx-auto md:mx-0" /> : `$${oraclePrice.toFixed(2)}`}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="text-xs text-muted-foreground mb-1">DMM Price</div>
                  <div className="text-lg font-mono font-semibold">
                    {isLoading ? <Skeleton className="h-6 w-20 mx-auto md:mx-0" /> : `$${dmmPrice.toFixed(2)}`}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="text-xs text-muted-foreground mb-1">Price Deviation</div>
                  <div className="text-lg font-mono font-semibold text-data-positive">
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 mx-auto md:mx-0" />
                    ) : (
                      `${Math.abs(((dmmPrice - oraclePrice) / oraclePrice) * 10000).toFixed(2)} bps`
                    )}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="text-xs text-muted-foreground mb-1">sMAANG Yield</div>
                  <div className="text-lg font-mono font-semibold text-primary">
                    —% APY
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
