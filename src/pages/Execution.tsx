import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices } from "@/hooks/useDeFiPrices";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useDirectSwap } from "@/hooks/useDirectSwap";
import { useBalances } from "@/hooks/useBalances";
import { CONTRACTS } from "@/config/contracts";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowDown, 
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Wallet,
  ArrowUpDown
} from "lucide-react";
import { ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import maangLogo from "@/assets/maang-logo.svg";
import a16zLogo from "@/assets/a16z-logo.svg";
import ycLogo from "@/assets/ycombinator-logo.svg";
import sequoiaLogo from "@/assets/sequoia-logo.svg";
import lightspeedLogo from "@/assets/lightspeed-logo.svg";
// ETO logo from public folder
const etoLogo = "/eto-logo.svg";

// Asset configurations with real contract addresses
const assetConfigs: Record<string, {
  name: string;
  symbol: string;
  logo: string;
  color: string;
  description: string;
  contractAddress: string;
  underlyingAsset: string;
  underlyingTicker: string;
  basePrice: number;
  tradeable: boolean; // Whether this asset can be traded via DMM
}> = {
  maang: {
    name: 'MAANG',
    symbol: 'MAANG',
    logo: maangLogo,
    color: '#10b981',
    description: 'MAANG is the native utility token of the ETO Protocol, providing holders with governance rights, staking rewards, and access to premium features. The token powers the Dynamic Market Maker (DMM) and enables decentralized trading of tokenized assets.',
    contractAddress: CONTRACTS.MAANG_TOKEN,
    underlyingAsset: 'ETO Protocol Token',
    underlyingTicker: 'MAANG',
    basePrice: 328.00,
    tradeable: true,
  },
  smaang: {
    name: 'Staked MAANG',
    symbol: 'sMAANG',
    logo: maangLogo,
    color: '#8b5cf6',
    description: 'sMAANG represents staked MAANG tokens in the ETO Protocol. Holders earn continuous staking rewards while maintaining liquidity through the liquid staking derivative. sMAANG can be traded or used as collateral across DeFi protocols.',
    contractAddress: CONTRACTS.SMAANG_VAULT,
    underlyingAsset: 'Staked MAANG Token',
    underlyingTicker: 'sMAANG',
    basePrice: 345.00,
    tradeable: false, // Staking only
  },
  usdc: {
    name: 'USD Coin',
    symbol: 'USDC',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: '#2775ca',
    description: 'USDC is a fully reserved stablecoin pegged 1:1 to the US dollar. It serves as the primary settlement currency on the ETO Protocol for trading and staking operations.',
    contractAddress: CONTRACTS.USDC,
    underlyingAsset: 'USD Coin',
    underlyingTicker: 'USDC',
    basePrice: 1.00,
    tradeable: true,
  },
  ycombinator: {
    name: 'Y Combinator',
    symbol: 'YC',
    logo: ycLogo,
    color: '#E87136',
    description: 'The Y Combinator Index tracks the performance of top YC-backed companies that have tokenized their equity on the ETO Protocol. This thematic index provides exposure to high-growth startups across AI, fintech, and enterprise software sectors.',
    contractAddress: '0x0000000000000000000000000000000000000000', // Coming soon
    underlyingAsset: 'YC Portfolio Index',
    underlyingTicker: 'YC',
    basePrice: 156.80,
    tradeable: false, // Coming soon
  },
  sequoia: {
    name: 'Sequoia Capital',
    symbol: 'SEQ',
    logo: sequoiaLogo,
    color: '#00713A',
    description: 'The Sequoia Index provides tokenized exposure to Sequoia Capital portfolio companies available on ETO. This prestigious fund tracks companies across consumer, enterprise, and crypto sectors.',
    contractAddress: '0x0000000000000000000000000000000000000000', // Coming soon
    underlyingAsset: 'Sequoia Portfolio Index',
    underlyingTicker: 'SEQ',
    basePrice: 234.50,
    tradeable: false, // Coming soon
  },
  lightspeed: {
    name: 'Lightspeed',
    symbol: 'LSVP',
    logo: lightspeedLogo,
    color: '#DE7564',
    description: 'The Lightspeed Venture Partners Index tracks tokenized equity from LSVP portfolio companies on ETO. This fund focuses on consumer internet, enterprise technology, and cleantech sectors.',
    contractAddress: '0x0000000000000000000000000000000000000000', // Coming soon
    underlyingAsset: 'Lightspeed Portfolio Index',
    underlyingTicker: 'LSVP',
    basePrice: 89.25,
    tradeable: false, // Coming soon
  },
  a16z: {
    name: 'a16z',
    symbol: 'A16Z',
    logo: a16zLogo,
    color: '#5E1D23',
    description: 'The Andreessen Horowitz Index offers exposure to a16z portfolio companies tokenized on ETO Protocol. This flagship fund tracks investments across crypto, bio, fintech, and enterprise software.',
    contractAddress: '0x0000000000000000000000000000000000000000', // Coming soon
    underlyingAsset: 'a16z Portfolio Index',
    underlyingTicker: 'A16Z',
    basePrice: 312.00,
    tradeable: false, // Coming soon
  },
};

// Generate mock price data
const generatePriceData = (days: number, basePrice: number, volatility: number = 0.02) => {
  const data = [];
  let price = basePrice * 0.95;
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 100;
  
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.45) * volatility * price;
    price = Math.max(price + change, basePrice * 0.8);
    data.push({
      time: new Date(now - (100 - i) * interval).toLocaleString(),
      timestamp: now - (100 - i) * interval,
      price: price,
    });
  }
  return data;
};

export default function Execution() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { setOpen } = useSidebar();
  const { dmmPrice } = useDeFiPrices();
  const { isAuthenticated } = useAuth();

  // Real contract hooks
  const {
    buyDRI,
    sellDRI,
    getBuyQuote,
    getSellQuote,
    getBalances,
    isLoading: isSwapLoading,
    isApproving
  } = useDirectSwap();
  const { blockchainBalances, getBlockchainBalance } = useBalances();

  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [userBalances, setUserBalances] = useState<{ usdc: string; dri: string }>({ usdc: '0', dri: '0' });

  const asset = assetConfigs[assetId || 'maang'] || assetConfigs.maang;

  // Fetch real user balances
  useEffect(() => {
    const fetchBalances = async () => {
      const balances = await getBalances();
      setUserBalances(balances);
    };
    fetchBalances();
  }, [getBalances, isProcessing]); // Refetch after trades
  
  // Calculate current price based on asset
  const currentPrice = useMemo(() => {
    if (assetId === 'usdc') return 1.00;
    if (assetId === 'maang' || assetId === 'smaang') return dmmPrice || asset.basePrice;
    return asset.basePrice;
  }, [assetId, dmmPrice, asset.basePrice]);

  const priceChange = useMemo(() => {
    if (assetId === 'usdc') return { value: 0, percent: 0 };
    const change = (Math.random() * 4 - 1).toFixed(4);
    return { value: parseFloat(change) * 0.1, percent: parseFloat(change) };
  }, [assetId]);

  // Generate chart data based on time range
  const chartData = useMemo(() => {
    const days = timeRange === '1D' ? 1 : timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : timeRange === '1Y' ? 365 : 730;
    return generatePriceData(days, currentPrice);
  }, [timeRange, currentPrice]);

  // Calculate receive amount based on pay amount
  useEffect(() => {
    if (payAmount && !isNaN(parseFloat(payAmount))) {
      const pay = parseFloat(payAmount);
      if (activeTab === 'buy') {
        setReceiveAmount((pay / currentPrice).toFixed(6));
      } else {
        setReceiveAmount((pay * currentPrice).toFixed(2));
      }
    } else {
      setReceiveAmount('');
    }
  }, [payAmount, currentPrice, activeTab]);

  useEffect(() => {
    setOpen(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [setOpen]);

  // Reset form when switching tabs
  useEffect(() => {
    setPayAmount('');
    setReceiveAmount('');
    setOrderError(null);
  }, [activeTab]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(asset.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSwapDirection = () => {
    setActiveTab(activeTab === 'buy' ? 'sell' : 'buy');
  };

  const validateOrder = (): boolean => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setOrderError('Please enter a valid amount');
      return false;
    }
    if (parseFloat(payAmount) < 1) {
      setOrderError('Minimum order amount is 1 USDC');
      return false;
    }
    setOrderError(null);
    return true;
  };

  const handleExecuteOrder = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (!validateOrder()) return;

    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    // Check if asset is tradeable
    if (!asset.tradeable) {
      toast.error(`${asset.symbol} trading coming soon!`);
      setShowConfirmation(false);
      return;
    }

    // Only MAANG can be traded via DMM currently
    if (assetId !== 'maang' && assetId !== 'usdc') {
      toast.error(`Only MAANG trading is available. ${asset.symbol} coming soon!`);
      setShowConfirmation(false);
      return;
    }

    setIsProcessing(true);

    try {
      let txHash: string | null = null;

      if (activeTab === 'buy') {
        // Buy MAANG with USDC
        txHash = await buyDRI(payAmount);
      } else {
        // Sell MAANG for USDC
        txHash = await sellDRI(payAmount);
      }

      if (txHash) {
        // Navigate to order confirmation page
        navigate('/transaction-complete', {
          state: {
            type: activeTab,
            asset: asset.symbol,
            payAmount: payAmount,
            receiveAmount: receiveAmount,
            price: currentPrice,
            txHash: txHash,
          }
        });
      }
    } catch (error: any) {
      console.error('Trade error:', error);
      toast.error(error.message || 'Trade failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  const estimatedFee = useMemo(() => {
    const amount = parseFloat(payAmount) || 0;
    return (amount * 0.003).toFixed(2); // 0.3% fee
  }, [payAmount]);

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <div className="pt-14 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div 
          className={`mb-3 sm:mb-4 md:mb-6 transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trade')}
            className="gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground -ml-2 text-[13px] sm:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Back to</span> Assets
          </Button>
        </div>

        {/* Main Layout - Chart Left, Swap Right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Asset Info & Chart */}
          <div 
            className={`space-y-4 md:space-y-6 transition-all duration-700 ease-out delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Asset Header */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: `${asset.color}20` }}
              >
                <img src={asset.logo} alt={asset.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">{asset.name}</h1>
                <span className="text-xs sm:text-sm text-muted-foreground">{asset.symbol}</span>
              </div>
            </div>

            {/* Price Card with Chart */}
            <Card className="overflow-hidden border-border-subtle">
              <CardContent className="p-3 sm:p-4 md:p-6">
                {/* Price Header */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-1">
                    ${formatPrice(currentPrice)}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {priceChange.percent >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-data-positive" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-data-negative" />
                    )}
                    <span className={`text-xs sm:text-sm font-medium ${priceChange.percent >= 0 ? 'text-data-positive' : 'text-data-negative'}`}>
                      {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">24H</span>
                  </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-1 mb-3 sm:mb-4 md:mb-6 overflow-x-auto scrollbar-hide pb-1 -mb-1">
                  {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium transition-all flex-shrink-0 ${
                        timeRange === range
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div className="h-48 sm:h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={asset.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={asset.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          if (timeRange === '1D') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        }}
                        interval="preserveStartEnd"
                        minTickGap={50}
                      />
                      <YAxis 
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        orientation="right"
                        width={50}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="text-sm font-medium">${Number(payload[0].value).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={asset.color}
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-border-subtle">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">About {asset.name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {showMoreDescription ? asset.description : `${asset.description.slice(0, 140)}...`}
                  <button 
                    className="text-primary ml-1 hover:underline font-medium"
                    onClick={() => setShowMoreDescription(!showMoreDescription)}
                  >
                    {showMoreDescription ? 'Show Less' : 'Show More'}
                  </button>
                </p>

                {/* Asset Details Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border-subtle">
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Network</div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/15 flex items-center justify-center">
                        <img src={etoLogo} alt="ETO" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">ETO L1</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Asset Type</div>
                    <div className="text-xs sm:text-sm font-medium truncate">{asset.underlyingAsset}</div>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Contract</div>
                    <button 
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium group"
                      onClick={handleCopyAddress}
                    >
                      <span className="font-mono">{asset.contractAddress}</span>
                      {copied ? (
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-data-positive flex-shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      )}
                    </button>
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Ticker</div>
                    <div className="text-xs sm:text-sm font-medium font-mono">{asset.underlyingTicker}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Swap Widget */}
          <div 
            className={`transition-all duration-700 ease-out delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Card className="border-border-subtle lg:sticky lg:top-20">
              <CardContent className="p-3 sm:p-4 md:p-5">
                {/* Buy/Sell Toggle & Network */}
                <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
                  {/* Toggle */}
                  <div className="inline-flex p-0.5 rounded-lg bg-muted/60 border border-border/40">
                    <button
                      onClick={() => setActiveTab('buy')}
                      className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-md text-[12px] sm:text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'buy'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {activeTab === 'buy' && (
                        <span className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
                      )}
                      Buy
                    </button>
                    <button
                      onClick={() => setActiveTab('sell')}
                      className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-md text-[12px] sm:text-[13px] font-medium transition-all duration-200 ${
                        activeTab === 'sell'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {activeTab === 'sell' && (
                        <span className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-destructive" />
                      )}
                      Sell
                    </button>
                  </div>

                  {/* Network Indicator */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/15 flex items-center justify-center">
                      <img src={etoLogo} alt="ETO" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-medium text-foreground">ETO L1</span>
                  </div>
                </div>

                {/* Pay Input */}
                <div className="space-y-2.5 sm:space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <label className="text-[11px] sm:text-xs text-muted-foreground">You Pay</label>
                      <button
                        onClick={() => setPayAmount(activeTab === 'buy' ? userBalances.usdc : userBalances.dri)}
                        className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Wallet className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Balance: {activeTab === 'buy' ? `${userBalances.usdc} USDC` : `${userBalances.dri} MAANG`}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border-subtle focus-within:border-primary/50 transition-colors">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="bg-transparent text-xl sm:text-2xl font-semibold w-full outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-background border border-border-subtle flex-shrink-0">
                        <img 
                          src={activeTab === 'buy' ? 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040' : asset.logo} 
                          alt={activeTab === 'buy' ? 'USDC' : asset.symbol}
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-xs sm:text-sm font-medium">{activeTab === 'buy' ? 'USDC' : asset.symbol}</span>
                      </div>
                    </div>
                  </div>

                  {/* Swap Direction Button */}
                  <div className="flex justify-center -my-0.5 sm:-my-1 relative z-10">
                    <button 
                      onClick={handleSwapDirection}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted border-3 sm:border-4 border-background flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Receive Input */}
                  <div>
                    <label className="text-[11px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 block">You Receive</label>
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border-subtle">
                      <input
                        type="text"
                        placeholder="0.00"
                        value={receiveAmount}
                        readOnly
                        className="bg-transparent text-xl sm:text-2xl font-semibold w-full outline-none placeholder:text-muted-foreground/40"
                      />
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-background border border-border-subtle flex-shrink-0">
                        <img 
                          src={activeTab === 'buy' ? asset.logo : 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040'} 
                          alt={activeTab === 'buy' ? asset.symbol : 'USDC'}
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-xs sm:text-sm font-medium">{activeTab === 'buy' ? asset.symbol : 'USDC'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Error */}
                {orderError && (
                  <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive flex-shrink-0" />
                    <span className="text-[11px] sm:text-xs text-destructive">{orderError}</span>
                  </div>
                )}

                {/* Rate Info */}
                <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/20 border border-border-subtle space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs text-muted-foreground">Rate</span>
                    <span className="text-[11px] sm:text-xs font-medium font-mono">
                      1 {asset.symbol} = ${formatPrice(currentPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs text-muted-foreground">Network Fee</span>
                    <span className="text-[11px] sm:text-xs font-medium text-data-positive">Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs text-muted-foreground">Platform Fee (0.3%)</span>
                    <span className="text-[11px] sm:text-xs font-medium font-mono">${estimatedFee}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className={`w-full mt-4 sm:mt-5 h-10 sm:h-12 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base ${
                    activeTab === 'buy'
                      ? 'bg-data-positive hover:bg-data-positive/90'
                      : 'bg-data-negative hover:bg-data-negative/90'
                  }`}
                  size="lg"
                  onClick={handleExecuteOrder}
                  disabled={isProcessing || isSwapLoading || isApproving || !payAmount || !asset.tradeable}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : isProcessing || isSwapLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : !isAuthenticated ? (
                    'Connect Wallet'
                  ) : !payAmount ? (
                    'Enter Amount'
                  ) : !asset.tradeable ? (
                    'Coming Soon'
                  ) : (
                    `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${asset.symbol}`
                  )}
                </Button>

                {/* Help Section */}
                <button 
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-full mt-3 sm:mt-4 flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Need help?</span>
                  </div>
                  {showHelp ? (
                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  )}
                </button>
                
                {showHelp && (
                  <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 text-[11px] sm:text-xs text-muted-foreground space-y-1.5 sm:space-y-2">
                    <p>• Enter the amount you want to trade in the "You Pay" field</p>
                    <p>• The receive amount is calculated automatically</p>
                    <p>• Click the swap button to switch between buying and selling</p>
                    <p>• Review your order details before confirming</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Review your order details before confirming
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div>
                <div className="text-xs text-muted-foreground mb-1">You Pay</div>
                <div className="text-lg font-semibold">{payAmount} {activeTab === 'buy' ? 'USDC' : asset.symbol}</div>
              </div>
              <ArrowDown className="w-5 h-5 text-muted-foreground" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">You Receive</div>
                <div className="text-lg font-semibold">{receiveAmount} {activeTab === 'buy' ? asset.symbol : 'USDC'}</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">1 {asset.symbol} = ${formatPrice(currentPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">${estimatedFee}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border-subtle">
                <span className="font-medium">Total</span>
                <span className="font-semibold">${(parseFloat(payAmount || '0') + parseFloat(estimatedFee)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={confirmOrder} 
              disabled={isProcessing}
              className={activeTab === 'buy' ? 'bg-data-positive hover:bg-data-positive/90' : 'bg-data-negative hover:bg-data-negative/90'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${activeTab === 'buy' ? 'Buy' : 'Sell'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
