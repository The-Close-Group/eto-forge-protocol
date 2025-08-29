
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Users, Shield, Star, Bell, ExternalLink, Copy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

// Extended asset data with comprehensive details
const ASSET_DETAILS = {
  MAANG: {
    name: "Meta AI & Analytics Next Generation",
    symbol: "MAANG",
    price: 238.00,
    change24h: 2.5,
    marketCap: "5.2B",
    volume24h: "124M",
    circulatingSupply: "21.8M",
    totalSupply: "25M",
    allTimeHigh: 445.20,
    allTimeLow: 15.30,
    week52High: 445.20,
    week52Low: 98.40,
    beta: 1.34,
    volatility: "High",
    rsi: 67.8,
    oracleStatus: "Active",
    description: "MAANG represents the next generation of AI-powered analytics and meta-intelligence platforms. Built on advanced blockchain infrastructure, it provides decentralized AI services and data analytics solutions with cutting-edge machine learning capabilities.",
    icon: "🤖",
    sector: "AI & Technology",
    website: "https://maang.ai",
    whitepaper: "https://docs.maang.ai/whitepaper"
  },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    price: 3567.00,
    change24h: 1.8,
    marketCap: "429B",
    volume24h: "12.8B",
    circulatingSupply: "120.3M",
    totalSupply: "120.3M",
    allTimeHigh: 4891.70,
    allTimeLow: 0.43,
    week52High: 4200.00,
    week52Low: 1523.00,
    beta: 1.18,
    volatility: "Medium",
    rsi: 58.2,
    oracleStatus: "Active",
    description: "Ethereum is a decentralized platform that runs smart contracts and serves as the foundation for thousands of decentralized applications (dApps) and DeFi protocols. It's the world's second-largest cryptocurrency by market cap.",
    icon: "⟐",
    sector: "Smart Contract Platform",
    website: "https://ethereum.org",
    whitepaper: "https://ethereum.org/whitepaper"
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    price: 1.00,
    change24h: 0.1,
    marketCap: "32.8B",
    volume24h: "3.2B",
    circulatingSupply: "32.8B",
    totalSupply: "32.8B",
    allTimeHigh: 1.17,
    allTimeLow: 0.89,
    week52High: 1.05,
    week52Low: 0.98,
    beta: 0.02,
    volatility: "Very Low",
    rsi: 50.0,
    oracleStatus: "Active",
    description: "USD Coin is a fully reserved dollar digital currency that is always redeemable 1:1 for US dollars. It provides stability and transparency for digital transactions with regular attestations.",
    icon: "💵",
    sector: "Stablecoin",
    website: "https://centre.io",
    whitepaper: "https://centre.io/pdfs/centre-whitepaper.pdf"
  },
  AVAX: {
    name: "Avalanche",
    symbol: "AVAX",
    price: 26.00,
    change24h: 3.2,
    marketCap: "10.1B",
    volume24h: "284M",
    circulatingSupply: "388.7M",
    totalSupply: "720M",
    allTimeHigh: 146.22,
    allTimeLow: 2.79,
    week52High: 65.00,
    week52Low: 9.80,
    beta: 1.45,
    volatility: "High",
    rsi: 72.1,
    oracleStatus: "Active",
    description: "Avalanche is a high-performance blockchain platform for decentralized applications and custom blockchain networks. It offers near-instant transaction finality and low fees with innovative consensus mechanism.",
    icon: "🔺",
    sector: "Layer 1 Blockchain",
    website: "https://avax.network",
    whitepaper: "https://assets.website-files.com/5d80307810123f5ffbb34d6e/6008d7bbf8b10d1eb01e7e16_Avalanche%20Platform%20Whitepaper.pdf"
  },
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    price: 45000.00,
    change24h: 1.2,
    marketCap: "880B",
    volume24h: "28B",
    circulatingSupply: "19.8M",
    totalSupply: "21M",
    allTimeHigh: 69000.00,
    allTimeLow: 0.0008,
    week52High: 69000.00,
    week52Low: 26500.00,
    beta: 1.25,
    volatility: "Medium",
    rsi: 61.5,
    oracleStatus: "Active",
    description: "Bitcoin is the world's first cryptocurrency and digital payment system. It operates on a peer-to-peer network without central authority or banks, serving as digital gold and store of value.",
    icon: "₿",
    sector: "Store of Value",
    website: "https://bitcoin.org",
    whitepaper: "https://bitcoin.org/bitcoin.pdf"
  },
  ARB: {
    name: "Arbitrum",
    symbol: "ARB",
    price: 0.90,
    change24h: 8.7,
    marketCap: "3.4B",
    volume24h: "458M",
    circulatingSupply: "3.8B",
    totalSupply: "10B",
    allTimeHigh: 8.67,
    allTimeLow: 0.65,
    week52High: 2.40,
    week52Low: 0.65,
    beta: 1.52,
    volatility: "High",
    rsi: 78.3,
    oracleStatus: "Active",
    description: "Arbitrum is a Layer 2 scaling solution for Ethereum that offers fast, low-cost transactions while maintaining Ethereum-level security through optimistic rollup technology.",
    icon: "🔷",
    sector: "Layer 2 Scaling",
    website: "https://arbitrum.io",
    whitepaper: "https://arbitrum.io/arb-whitepaper.pdf"
  },
  OP: {
    name: "Optimism",
    symbol: "OP",
    price: 1.85,
    change24h: 3.1,
    marketCap: "2.9B",
    volume24h: "312M",
    circulatingSupply: "1.6B",
    totalSupply: "4.3B",
    allTimeHigh: 4.57,
    allTimeLow: 0.42,
    week52High: 4.57,
    week52Low: 0.85,
    beta: 1.38,
    volatility: "High",
    rsi: 64.7,
    oracleStatus: "Active",
    description: "Optimism is an Ethereum Layer 2 blockchain powered by optimistic rollups, designed to scale Ethereum while maintaining its security and composability.",
    icon: "🔴",
    sector: "Layer 2 Scaling",
    website: "https://optimism.io",
    whitepaper: "https://optimism.io/optimism-whitepaper.pdf"
  },
  MATIC: {
    name: "Polygon",
    symbol: "MATIC",
    price: 0.75,
    change24h: -0.8,
    marketCap: "7.1B",
    volume24h: "298M",
    circulatingSupply: "9.5B",
    totalSupply: "10B",
    allTimeHigh: 2.92,
    allTimeLow: 0.0031,
    week52High: 1.27,
    week52Low: 0.31,
    beta: 1.41,
    volatility: "High",
    rsi: 45.2,
    oracleStatus: "Active",
    description: "Polygon is a decentralized Ethereum scaling platform that enables developers to build scalable user-friendly dApps with low transaction fees.",
    icon: "🟣",
    sector: "Layer 2 Scaling",
    website: "https://polygon.technology",
    whitepaper: "https://polygon.technology/lightpaper-polygon.pdf"
  }
};

// Generate realistic chart data
const generateChartData = (price: number, days: number = 30) => {
  const data = [];
  let currentPrice = price * 0.9;
  
  for (let i = days; i >= 0; i--) {
    const variation = (Math.random() - 0.5) * 0.08;
    const trend = Math.sin(i * 0.2) * 0.02;
    currentPrice = currentPrice * (1 + variation + trend);
    
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: Number(currentPrice.toFixed(2)),
      volume: Math.random() * 1000000 + 500000
    });
  }
  
  return data;
};

export default function AssetDetails() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('1M');
  const [activeTab, setActiveTab] = useState('overview');

  const asset = symbol ? ASSET_DETAILS[symbol as keyof typeof ASSET_DETAILS] : null;

  useEffect(() => {
    if (asset) {
      const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 90;
      setChartData(generateChartData(asset.price, days));
    }
  }, [asset, timeframe]);

  if (!asset) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
          <Button onClick={() => navigate('/trade')}>Back to Trade</Button>
        </div>
      </div>
    );
  }

  const handleTrade = () => {
    navigate(`/order?asset=${symbol}&side=buy`);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(`0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`);
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/trade')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{asset.icon}</span>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{asset.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground font-mono">{asset.symbol}</p>
                <span className="px-2 py-1 bg-accent/10 text-xs rounded-sm">{asset.sector}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Price Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
              <div className="space-y-1">
                <div className="text-3xl lg:text-4xl font-bold font-mono">
                  ${asset.price.toLocaleString()}
                </div>
                <div className={`flex items-center gap-2 text-lg ${
                  asset.change24h >= 0 ? 'text-data-positive' : 'text-data-negative'
                }`}>
                  {asset.change24h >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h}% (24h)
                </div>
              </div>
                </div>
                <Button size="lg" onClick={handleTrade}>
                  Trade {asset.symbol}
                </Button>
              </div>
              
              {/* Price Range Indicator */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate">24h High</p>
                  <p className="font-medium leading-relaxed truncate">${(asset.price * 1.05).toFixed(2)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate">24h Low</p>
                  <p className="font-medium leading-relaxed truncate">${(asset.price * 0.95).toFixed(2)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate">52W High</p>
                  <p className="font-medium leading-relaxed truncate">${asset.week52High.toFixed(2)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate">52W Low</p>
                  <p className="font-medium leading-relaxed truncate">${asset.week52Low.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Price Chart</CardTitle>
                <div className="flex gap-1">
                  {['1D', '1W', '1M', '3M'].map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About {asset.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {asset.description}
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={asset.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Website
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={asset.whitepaper} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Whitepaper
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technical Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RSI (14)</span>
                      <span className={`font-mono ${asset.rsi > 70 ? 'text-data-negative' : asset.rsi < 30 ? 'text-data-positive' : ''}`}>
                        {asset.rsi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beta</span>
                      <span className="font-mono">{asset.beta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volatility</span>
                      <span className={`font-mono ${
                        asset.volatility === 'High' ? 'text-data-negative' : 
                        asset.volatility === 'Low' ? 'text-data-positive' : ''
                      }`}>
                        {asset.volatility}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Price Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All-Time High</span>
                      <span className="font-mono">${asset.allTimeHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All-Time Low</span>
                      <span className="font-mono">${asset.allTimeLow.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From ATH</span>
                      <span className="font-mono text-data-negative">
                        -{(((asset.allTimeHigh - asset.price) / asset.allTimeHigh) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Latest News & Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: "Major partnership announcement drives adoption", time: "2 hours ago", sentiment: "positive" },
                      { title: "Technical upgrade improves network efficiency", time: "1 day ago", sentiment: "positive" },
                      { title: "Market analysis shows strong fundamentals", time: "2 days ago", sentiment: "neutral" }
                    ].map((news, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-sm">
                        <div>
                          <p className="font-medium text-sm">{news.title}</p>
                          <p className="text-xs text-muted-foreground">{news.time}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          news.sentiment === 'positive' ? 'bg-data-positive' : 
                          news.sentiment === 'negative' ? 'bg-data-negative' : 'bg-muted'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Market Cap</span>
                <span className="font-medium leading-relaxed text-right">${asset.marketCap}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">24h Volume</span>
                <span className="font-medium leading-relaxed text-right">${asset.volume24h}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Circulating Supply</span>
                <span className="font-mono">{asset.circulatingSupply}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-mono">{asset.totalSupply}</span>
              </div>
            </CardContent>
          </Card>

          {/* Oracle Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Oracle Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-data-positive rounded-full"></div>
                <span className="font-medium text-data-positive">{asset.oracleStatus}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Real-time price feeds are operational and secure
              </p>
            </CardContent>
          </Card>

          {/* Contract Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm">
                <span className="font-mono text-xs flex-1 truncate">
                  0x{Math.random().toString(16).substr(2, 8)}...{Math.random().toString(16).substr(2, 8)}
                </span>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-data-positive" />
                <div>
                  <p className="font-medium">High Liquidity</p>
                  <p className="text-sm text-muted-foreground">Low slippage trading</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Community Verified</p>
                  <p className="text-sm text-muted-foreground">Trusted by traders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-data-positive" />
                <div>
                  <p className="font-medium">Audited Smart Contract</p>
                  <p className="text-sm text-muted-foreground">Security verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
