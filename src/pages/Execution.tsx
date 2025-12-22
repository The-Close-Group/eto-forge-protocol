import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { useDeFiPrices, usePriceHistory } from "@/hooks/useDeFiPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ArrowDown, 
  ChevronDown, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import maangLogo from "@/assets/maang-logo.svg";

// Asset configurations
const assetConfigs: Record<string, {
  name: string;
  symbol: string;
  logo: string;
  color: string;
  description: string;
  contractAddress: string;
  underlyingAsset: string;
  underlyingTicker: string;
}> = {
  maang: {
    name: 'MAANG',
    symbol: 'MAANG',
    logo: maangLogo,
    color: '#10b981',
    description: 'MAANG is the native utility token of the ETO Protocol, providing holders with governance rights, staking rewards, and access to premium features. The token powers the Dynamic Market Maker (DMM) and enables decentralized trading of tokenized assets.',
    contractAddress: '0x2d1f...bdee',
    underlyingAsset: 'ETO Protocol Token',
    underlyingTicker: 'MAANG',
  },
  smaang: {
    name: 'Staked MAANG',
    symbol: 'sMAANG',
    logo: maangLogo,
    color: '#8b5cf6',
    description: 'sMAANG represents staked MAANG tokens in the ETO Protocol. Holders earn continuous staking rewards while maintaining liquidity through the liquid staking derivative. sMAANG can be traded or used as collateral across DeFi protocols.',
    contractAddress: '0x8f3a...c421',
    underlyingAsset: 'Staked MAANG Token',
    underlyingTicker: 'sMAANG',
  },
  usdc: {
    name: 'USD Coin',
    symbol: 'USDC',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: '#2775ca',
    description: 'USDC is a fully reserved stablecoin pegged 1:1 to the US dollar. It serves as the primary settlement currency on the ETO Protocol for trading and staking operations.',
    contractAddress: '0x1c7d...9a12',
    underlyingAsset: 'USD Coin',
    underlyingTicker: 'USDC',
  },
  // Thematic Index Funds
  ycombinator: {
    name: 'Y Combinator',
    symbol: 'YC',
    logo: 'https://www.ycombinator.com/assets/ycdc/ycombinator-logo-b603b0a270e12b1d42b7cca9d4527a9b206adf8293a77f9f3e8b6cb542fcbfa7.png',
    color: '#FF6600',
    description: 'The Y Combinator Index tracks the performance of top YC-backed companies that have tokenized their equity on the ETO Protocol. This thematic index provides exposure to high-growth startups across AI, fintech, and enterprise software sectors. Holdings are rebalanced quarterly based on market cap and trading volume.',
    contractAddress: '0x4a2b...7f31',
    underlyingAsset: 'YC Portfolio Index',
    underlyingTicker: 'YC',
  },
  sequoia: {
    name: 'Sequoia Capital',
    symbol: 'SEQ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sequoia_Capital_logo.svg/2560px-Sequoia_Capital_logo.svg.png',
    color: '#00A651',
    description: 'The Sequoia Index provides tokenized exposure to Sequoia Capital portfolio companies available on ETO. This prestigious fund tracks companies across consumer, enterprise, and crypto sectors that have received Sequoia backing. The index offers diversified exposure to Silicon Valley top-tier venture investments.',
    contractAddress: '0x6c3d...8e42',
    underlyingAsset: 'Sequoia Portfolio Index',
    underlyingTicker: 'SEQ',
  },
  lightspeed: {
    name: 'Lightspeed',
    symbol: 'LSVP',
    logo: 'https://lsvp.com/wp-content/uploads/2021/03/lightspeed-logo.svg',
    color: '#0066CC',
    description: 'The Lightspeed Venture Partners Index tracks tokenized equity from LSVP portfolio companies on ETO. This fund focuses on consumer internet, enterprise technology, and cleantech sectors. Lightspeed has backed companies like Snap, Affirm, and Mulesoft, providing exposure to proven growth strategies.',
    contractAddress: '0x9d4e...2a53',
    underlyingAsset: 'Lightspeed Portfolio Index',
    underlyingTicker: 'LSVP',
  },
  a16z: {
    name: 'a16z',
    symbol: 'A16Z',
    logo: 'https://a16z.com/wp-content/themes/developer/a16z/assets/images/a16z-logo.svg',
    color: '#000000',
    description: 'The Andreessen Horowitz Index offers exposure to a16z portfolio companies tokenized on ETO Protocol. This flagship fund tracks investments across crypto, bio, fintech, and enterprise software. a16z pioneering approach to venture capital is now accessible through decentralized markets.',
    contractAddress: '0x1f5a...6b64',
    underlyingAsset: 'a16z Portfolio Index',
    underlyingTicker: 'A16Z',
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
  const { dmmPrice, oraclePrice, isLoading: isPriceLoading } = useDeFiPrices();
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMoreDescription, setShowMoreDescription] = useState(false);

  const asset = assetConfigs[assetId || 'maang'] || assetConfigs.maang;
  
  // Calculate current price based on asset
  const currentPrice = useMemo(() => {
    if (assetId === 'usdc') return 1.00;
    return dmmPrice || 12.50;
  }, [assetId, dmmPrice]);

  const priceChange = useMemo(() => {
    if (assetId === 'usdc') return { value: 0, percent: 0 };
    return { value: 0.25, percent: 2.0144 };
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

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(asset.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-background">
      <div className="max-w-7xl">
        {/* Back Button */}
        <div 
          className={`mb-6 transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trade')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assets
          </Button>
        </div>

        {/* Main Layout - Chart Left, Swap Right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column - Asset Info & Chart */}
          <div 
            className={`space-y-6 transition-all duration-700 ease-out delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Asset Header */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                style={{ background: `${asset.color}15` }}
              >
                <img src={asset.logo} alt={asset.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{asset.name}</h1>
                <span className="text-sm text-muted-foreground">{asset.symbol}</span>
              </div>
            </div>

            {/* Price Card with Chart */}
            <Card className="overflow-hidden border-border-subtle">
              <CardContent className="p-6">
                {/* Price Header */}
                <div className="mb-6">
                  <div className="text-4xl font-semibold tracking-tight mb-2">
                    ${formatPrice(currentPrice)}
                  </div>
                  <div className="flex items-center gap-2">
                    {priceChange.percent >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-data-positive" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-data-negative" />
                    )}
                    <span className={`text-sm font-medium ${priceChange.percent >= 0 ? 'text-data-positive' : 'text-data-negative'}`}>
                      ${priceChange.value.toFixed(2)} ({priceChange.percent.toFixed(4)}%)
                    </span>
                    <span className="text-sm text-muted-foreground">24H</span>
                  </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-1 mb-6">
                  {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
                <div className="h-80">
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
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value.toFixed(2)}`}
                        orientation="right"
                        width={60}
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
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {showMoreDescription ? asset.description : `${asset.description.slice(0, 200)}...`}
                  <button 
                    className="text-primary ml-1 hover:underline"
                    onClick={() => setShowMoreDescription(!showMoreDescription)}
                  >
                    {showMoreDescription ? 'Show Less' : 'Show More'}
                  </button>
                </p>

                {/* Asset Details Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-subtle">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Supported Chains</div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">E</span>
                      </div>
                      <span className="text-sm font-medium">ETO L1</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Underlying Asset Name</div>
                    <div className="text-sm font-medium">{asset.underlyingAsset}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Onchain Address</div>
                    <button 
                      className="flex items-center gap-2 text-sm font-medium group"
                      onClick={handleCopyAddress}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">E</span>
                      </div>
                      <span>{asset.contractAddress}</span>
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-data-positive" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                      )}
                    </button>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Underlying Asset Ticker</div>
                    <div className="text-sm font-medium">{asset.underlyingTicker}</div>
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
            <Card className="border-border-subtle sticky top-24">
              <CardContent className="p-6">
                {/* Buy/Sell Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('buy')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'buy'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => setActiveTab('sell')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'sell'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Sell
                    </button>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary">E</span>
                    </div>
                    <span className="text-xs font-medium text-primary">ETO L1</span>
                  </div>
                </div>

                {/* Pay Input */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Pay</label>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border-subtle">
                      <input
                        type="number"
                        placeholder="0"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="bg-transparent text-2xl font-semibold w-full outline-none placeholder:text-muted-foreground/50"
                      />
                      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-background border border-border-subtle hover:border-border transition-colors">
                        <img 
                          src={activeTab === 'buy' ? 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040' : asset.logo} 
                          alt={activeTab === 'buy' ? 'USDC' : asset.symbol}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">{activeTab === 'buy' ? 'USDC' : asset.symbol}</span>
                      </button>
                    </div>
                  </div>

                  {/* Swap Arrow */}
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-muted/50 border border-border-subtle flex items-center justify-center">
                      <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Receive Input */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Receive</label>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border-subtle">
                      <input
                        type="text"
                        placeholder="0"
                        value={receiveAmount}
                        readOnly
                        className="bg-transparent text-2xl font-semibold w-full outline-none placeholder:text-muted-foreground/50"
                      />
                      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-background border border-border-subtle hover:border-border transition-colors">
                        <img 
                          src={activeTab === 'buy' ? asset.logo : 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040'} 
                          alt={activeTab === 'buy' ? asset.symbol : 'USDC'}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">{activeTab === 'buy' ? asset.symbol : 'USDC'}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rate Info */}
                <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Rate</span>
                    <span className="text-xs font-medium">
                      1 {asset.symbol} = {formatPrice(currentPrice)} USDC (${formatPrice(currentPrice)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Shares Per Token</span>
                      <HelpCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium">1 {asset.symbol} = 1.00 {asset.underlyingTicker}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-6 h-12 rounded-xl font-semibold"
                  size="lg"
                  onClick={() => navigate('/signin')}
                >
                  Sign In to Continue
                </Button>

                {/* Disclaimer */}
                <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                  Join the waitlist after signing up to be among the first to experience the platform.
                </p>
                <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  ETO Protocol tokens have not been registered under the US Securities Act of 1933, as amended, or the securities or other laws of any other jurisdiction, and may not be offered or sold in the US or to US persons unless registered under the Act or exempt therefrom. The tokens are offered and sold in the EEA and UK solely to qualified investors, and in Switzerland solely to professional clients. Other prohibitions and restrictions apply. See additional information below.*
                </p>

                {/* Also Available On */}
                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Also Available On</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary">E</span>
                      </div>
                      <span className="text-xs text-muted-foreground">& 2 more</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Need Help */}
                <button className="w-full mt-4 flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Need help?</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

