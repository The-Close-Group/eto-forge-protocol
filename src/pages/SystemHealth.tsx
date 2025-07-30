
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Activity, 
  Target, 
  BarChart3, 
  Zap, 
  Network,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Clock,
  DollarSign,
  MemoryStick,
  Users
} from "lucide-react";

export default function SystemHealth() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-data-positive";
      case "warning": return "text-yellow-400";
      case "critical": return "text-data-negative";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal": return CheckCircle;
      case "warning": return AlertTriangle;
      case "critical": return XCircle;
      default: return Activity;
    }
  };

  const healthPercentage = 98.7;
  // Half circle calculations (180 degrees)
  const radius = 120;
  const circumference = Math.PI * radius; // Half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (healthPercentage / 100) * circumference;

  return (
    <div className="container max-w-7xl mx-auto p-6 pb-20 md:pb-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-mono font-bold uppercase tracking-wider mb-2">
          System Health
        </h1>
        <p className="text-muted-foreground font-mono tracking-wide">
          Real-time monitoring of ETO platform metrics
        </p>
      </div>

      {/* Central Speedometer */}
      <div className="flex justify-center mb-8">
        <div className="trading-panel w-96 h-72 flex flex-col items-center justify-center relative">
          {/* Half Circle Speedometer SVG */}
          <div className="relative w-80 h-48">
            <svg width="320" height="180" viewBox="0 0 320 180" className="overflow-visible">
              {/* Background arc - half circle */}
              <path
                d="M 40 140 A 120 120 0 0 1 280 140"
                stroke="hsl(var(--border))"
                strokeWidth="8"
                fill="transparent"
                opacity="0.3"
              />
              {/* Progress arc - half circle (98.7% of 180 degrees = 177.66 degrees) */}
              <path
                d="M 40 140 A 120 120 0 0 1 280 140"
                stroke="url(#healthGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="377.0"
                strokeDashoffset="4.9"
                strokeLinecap="round"
                className="transition-all duration-2000 ease-out"
              />
              {/* Scale marks */}
              {[0, 25, 50, 75, 100].map((value) => {
                const angle = (value / 100) * Math.PI;
                const x1 = 160 + 105 * Math.cos(Math.PI - angle);
                const y1 = 140 - 105 * Math.sin(Math.PI - angle);
                const x2 = 160 + 115 * Math.cos(Math.PI - angle);
                const y2 = 140 - 115 * Math.sin(Math.PI - angle);
                return (
                  <line
                    key={value}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                );
              })}
              {/* Scale labels */}
              {[0, 50, 100].map((value) => {
                const angle = (value / 100) * Math.PI;
                const x = 160 + 130 * Math.cos(Math.PI - angle);
                const y = 140 - 130 * Math.sin(Math.PI - angle);
                return (
                  <text
                    key={value}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground font-mono text-xs"
                  >
                    {value}
                  </text>
                );
              })}
              {/* Gradient definition */}
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: 'hsl(var(--data-positive))', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'hsl(var(--data-positive))', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-mono font-bold text-data-positive mb-1">
                {healthPercentage}%
              </div>
              <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
                System Health
              </div>
              <div className="text-xs font-mono text-accent uppercase tracking-wide">
                ETO Platform • Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="trading-panel text-center p-6 h-36 flex flex-col justify-center">
          <Network className="h-6 w-6 text-accent mx-auto mb-3" />
          <div className="text-3xl font-mono font-bold mb-2">12</div>
          <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Active Protocols
          </div>
          <div className="text-xs font-mono text-accent uppercase tracking-wide">
            Cross-chain networks
          </div>
        </div>

        <div className="trading-panel text-center p-6 h-36 flex flex-col justify-center">
          <Activity className="h-6 w-6 text-data-positive mx-auto mb-3" />
          <div className="text-3xl font-mono font-bold text-data-positive mb-2">
            99.97%
          </div>
          <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Uptime
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            30-day average
          </div>
        </div>

        <div className="trading-panel text-center p-6 h-36 flex flex-col justify-center">
          <Shield className="h-6 w-6 text-data-positive mx-auto mb-3" />
          <div className="text-3xl font-mono font-bold text-data-positive mb-2">
            $45.7M
          </div>
          <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Total Liquidity
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            +12.3% today
          </div>
        </div>
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="trading-panel p-6 h-36 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Order Inflows</span>
          </div>
          <div className="text-2xl font-mono font-bold text-data-positive mb-1">
            1,247
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            +23% last hour
          </div>
        </div>

        <div className="trading-panel p-6 h-36 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-accent" />
            <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Price Reports</span>
          </div>
          <div className="text-2xl font-mono font-bold text-data-positive mb-1">
            12/12
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            Past 12 blocks
          </div>
        </div>

        <div className="trading-panel p-6 h-36 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <MemoryStick className="h-5 w-5 text-accent" />
            <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Memory Usage</span>
          </div>
          <div className="text-2xl font-mono font-bold text-data-positive mb-1">
            67%
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            Optimal range
          </div>
        </div>

        <div className="trading-panel p-6 h-36 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-accent" />
            <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Active Sessions</span>
          </div>
          <div className="text-2xl font-mono font-bold text-data-positive mb-1">
            342
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            Trading now
          </div>
        </div>
      </div>

      {/* Peg Integrity Section */}
      <div className="trading-panel p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
            <Target className="h-7 w-7 text-accent flex-shrink-0" />
            Peg Integrity
          </h2>
          <p className="text-muted-foreground font-mono tracking-wide">
            Asset price deviation monitoring
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 p-6 bg-background/30 rounded-xl border border-border/40 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-lg font-mono font-medium tracking-wide">MAANG/USDC</span>
              <Badge variant="outline" className="font-mono text-xs bg-data-positive/10 text-data-positive border-data-positive/30 px-3 py-1">
                OPTIMAL
              </Badge>
            </div>
            <div className="text-3xl font-mono font-bold text-data-positive tracking-wide">0.02%</div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
              Deviation from peg
            </p>
          </div>
          
          <div className="space-y-4 p-6 bg-background/30 rounded-xl border border-border/40 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-lg font-mono font-medium tracking-wide">ETH/USD</span>
              <Badge variant="outline" className="font-mono text-xs bg-data-positive/10 text-data-positive border-data-positive/30 px-3 py-1">
                OPTIMAL
              </Badge>
            </div>
            <div className="text-3xl font-mono font-bold text-data-positive tracking-wide">0.05%</div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
              Deviation from peg
            </p>
          </div>

          <div className="space-y-4 p-6 bg-background/30 rounded-xl border border-border/40 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-lg font-mono font-medium tracking-wide">BTC/USD</span>
              <Badge variant="outline" className="font-mono text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/30 px-3 py-1">
                WATCH
              </Badge>
            </div>
            <div className="text-3xl font-mono font-bold text-yellow-400 tracking-wide">0.12%</div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide">
              Deviation from peg
            </p>
          </div>
        </div>
      </div>

      {/* Tracking & Pool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="trading-panel p-8 h-fit">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <BarChart3 className="h-7 w-7 text-accent flex-shrink-0" />
              Tracking Accuracy
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              System precision metrics
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">Asset Tracking Accuracy</span>
                <span className="text-data-positive font-mono font-bold text-lg">99.8%</span>
              </div>
              <Progress value={99.8} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">Price Feed Reliability</span>
                <span className="text-data-positive font-mono font-bold text-lg">99.95%</span>
              </div>
              <Progress value={99.95} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">Oracle Sync Rate</span>
                <span className="text-data-positive font-mono font-bold text-lg">100%</span>
              </div>
              <Progress value={100} className="h-3" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">System Response Time</span>
                <span className="text-data-positive font-mono font-bold text-lg">12ms</span>
              </div>
              <div className="text-sm text-muted-foreground font-mono">Average API latency</div>
            </div>
          </div>
        </div>

        <div className="trading-panel p-8 h-fit">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <Activity className="h-7 w-7 text-accent flex-shrink-0" />
              Pool Health
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              Liquidity pool analytics
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-background/30 rounded-xl border border-border/40 text-center">
              <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground mb-2">Utilization Rate</p>
              <p className="text-3xl font-mono font-bold text-data-positive mb-1">67%</p>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide">Optimal range</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">ETH Pool</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive flex-shrink-0" />
                  <span className="text-data-positive font-mono font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">USDC Pool</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive flex-shrink-0" />
                  <span className="text-data-positive font-mono font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-base font-mono tracking-wide">BTC Pool</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-400 font-mono font-medium">Monitor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network & DMM Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="trading-panel p-8 h-fit">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <Network className="h-7 w-7 text-accent flex-shrink-0" />
              Network Metrics
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              Blockchain performance data
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-background/30 rounded-xl border border-border/40 text-center h-24 flex flex-col justify-center">
                <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Block Time</p>
                <p className="text-2xl font-mono font-bold">12.1s</p>
                <p className="text-xs font-mono text-data-positive uppercase tracking-wide">Normal</p>
              </div>
              <div className="space-y-2 p-4 bg-background/30 rounded-xl border border-border/40 text-center h-24 flex flex-col justify-center">
                <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Gas Price</p>
                <p className="text-2xl font-mono font-bold">23 gwei</p>
                <p className="text-xs font-mono text-data-positive uppercase tracking-wide">Low</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm font-mono tracking-wide">Transaction Success Rate</span>
                <span className="text-data-positive font-mono font-bold text-lg">99.7%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm font-mono tracking-wide">Network Congestion</span>
                <span className="text-data-positive font-mono font-medium">Low</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-mono tracking-wide">Average Confirmation Time</span>
                <span className="text-data-positive font-mono font-medium">2.3s</span>
              </div>
            </div>
          </div>
        </div>

        <div className="trading-panel p-8 h-fit">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <Zap className="h-7 w-7 text-accent flex-shrink-0" />
              Service Status
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              DMM & bridge operational status
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm font-mono tracking-wide">Dynamic Market Maker</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive flex-shrink-0" />
                  <span className="text-data-positive font-mono font-medium">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm font-mono tracking-wide">Layer Zero Bridge</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive flex-shrink-0" />
                  <span className="text-data-positive font-mono font-medium">Operational</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm font-mono tracking-wide">Cross-chain Messaging</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive flex-shrink-0" />
                  <span className="text-data-positive font-mono font-medium">Online</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-mono tracking-wide">API Gateway</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive flex-shrink-0" />
                  <span className="text-data-positive font-mono font-medium">Healthy</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background/30 rounded-xl border border-border/40 text-center">
              <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground mb-2">Bridge Volume (24h)</p>
              <p className="text-3xl font-mono font-bold text-data-positive mb-1">$2.3M</p>
              <p className="text-xs font-mono text-data-positive uppercase tracking-wide">+8.4% vs yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
