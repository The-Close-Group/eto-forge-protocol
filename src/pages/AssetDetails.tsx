
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Activity, Users, Shield } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Extended asset data with details
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
    oracleStatus: "Active",
    description: "MAANG represents the next generation of AI-powered analytics and meta-intelligence platforms. Built on advanced blockchain infrastructure, it provides decentralized AI services and data analytics solutions.",
    icon: "🤖"
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
    oracleStatus: "Active",
    description: "Ethereum is a decentralized platform that runs smart contracts and serves as the foundation for thousands of decentralized applications (dApps) and DeFi protocols.",
    icon: "⟐"
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
    oracleStatus: "Active",
    description: "USD Coin is a fully reserved dollar digital currency that is always redeemable 1:1 for US dollars. It provides stability and transparency for digital transactions.",
    icon: "💵"
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
    oracleStatus: "Active",
    description: "Avalanche is a high-performance blockchain platform for decentralized applications and custom blockchain networks. It offers near-instant transaction finality and low fees.",
    icon: "🔺"
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
    oracleStatus: "Active",
    description: "Bitcoin is the world's first cryptocurrency and digital payment system. It operates on a peer-to-peer network without central authority or banks.",
    icon: "₿"
  }
};

// Mock chart data
const generateChartData = (price: number) => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const variation = (Math.random() - 0.5) * 0.1;
    data.push({
      time: i,
      price: price * (1 + variation)
    });
  }
  return data;
};

export default function AssetDetails() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<any[]>([]);

  const asset = symbol ? ASSET_DETAILS[symbol as keyof typeof ASSET_DETAILS] : null;

  useEffect(() => {
    if (asset) {
      setChartData(generateChartData(asset.price));
    }
  }, [asset]);

  if (!asset) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Asset Not Found</h1>
          <Button onClick={() => navigate('/trade')}>
            Back to Trade
          </Button>
        </div>
      </div>
    );
  }

  const handleTrade = () => {
    navigate(`/trade?asset=${symbol}`);
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/trade')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{asset.icon}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{asset.name}</h1>
            <p className="text-muted-foreground">{asset.symbol}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold font-mono">
                    ${asset.price.toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-2 text-lg font-mono ${
                    asset.change24h >= 0 ? 'text-data-positive' : 'text-data-negative'
                  }`}>
                    <TrendingUp className="h-4 w-4" />
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}% (24h)
                  </div>
                </div>
                <Button size="lg" onClick={handleTrade}>
                  Trade {asset.symbol}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Description */}
          <Card>
            <CardHeader>
              <CardTitle>About {asset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {asset.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Cap</span>
                <span className="font-mono">${asset.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24h Volume</span>
                <span className="font-mono">${asset.volume24h}</span>
              </div>
              <div className="flex justify-between">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
