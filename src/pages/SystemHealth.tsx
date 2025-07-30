
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
  XCircle
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
  const circumference = 2 * Math.PI * 120;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (healthPercentage / 100) * circumference;

  return (
    <div className="container max-w-7xl mx-auto p-6 pb-20 md:pb-6 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold font-mono uppercase tracking-wider text-foreground mb-3">
          System Health
        </h1>
        <p className="text-muted-foreground font-mono text-base tracking-wide">
          Real-time monitoring of ETO platform metrics
        </p>
      </div>

      {/* Central Speedometer */}
      <div className="flex justify-center mb-16">
        <div className="trading-panel w-96 h-96 flex flex-col items-center justify-center relative">
          {/* Speedometer SVG */}
          <div className="relative">
            <svg width="280" height="280" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-border/30"
              />
              {/* Progress circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                stroke="url(#healthGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: 'hsl(var(--data-positive))', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-mono font-bold text-data-positive tracking-tight mb-2">
                {healthPercentage}%
              </div>
              <div className="text-lg font-mono uppercase tracking-wider text-muted-foreground mb-1">
                System Health
              </div>
              <div className="text-sm font-mono text-data-positive uppercase tracking-wide">
                ETO Platform • Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="trading-panel text-center">
          <div className="flex justify-center mb-4">
            <Network className="h-8 w-8 text-accent" />
          </div>
          <div className="text-4xl font-mono font-bold tracking-wide mb-2">12</div>
          <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Active Protocols
          </div>
          <div className="text-xs font-mono text-accent uppercase tracking-wide">
            Cross-chain networks
          </div>
        </div>

        <div className="trading-panel text-center">
          <div className="flex justify-center mb-4">
            <Activity className="h-8 w-8 text-data-positive" />
          </div>
          <div className="text-4xl font-mono font-bold text-data-positive tracking-wide mb-2">
            99.97%
          </div>
          <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Uptime
          </div>
          <div className="text-xs font-mono text-data-positive uppercase tracking-wide">
            30-day average
          </div>
        </div>

        <div className="trading-panel text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-8 w-8 text-data-positive" />
          </div>
          <div className="text-4xl font-mono font-bold text-data-positive tracking-wide mb-2">
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

      {/* Peg Integrity Section */}
      <div className="trading-panel">
        <div className="mb-8">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
            <Target className="h-7 w-7 text-accent" />
            Peg Integrity
          </h2>
          <p className="text-muted-foreground font-mono tracking-wide">
            Asset price deviation monitoring
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 p-6 bg-background/30 rounded-xl border border-border/40">
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
          
          <div className="space-y-4 p-6 bg-background/30 rounded-xl border border-border/40">
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

          <div className="space-y-4 p-6 bg-background/30 rounded-xl border border-border/40">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="trading-panel">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <BarChart3 className="h-7 w-7 text-accent" />
              Tracking Accuracy
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              System precision metrics
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">Asset Tracking Accuracy</span>
                <span className="text-data-positive font-mono font-bold text-xl">99.8%</span>
              </div>
              <Progress value={99.8} className="h-4" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">Price Feed Reliability</span>
                <span className="text-data-positive font-mono font-bold text-xl">99.95%</span>
              </div>
              <Progress value={99.95} className="h-4" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono tracking-wide">Oracle Sync Rate</span>
                <span className="text-data-positive font-mono font-bold text-xl">100%</span>
              </div>
              <Progress value={100} className="h-4" />
            </div>
          </div>
        </div>

        <div className="trading-panel">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <Activity className="h-7 w-7 text-accent" />
              Pool Health
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              Liquidity pool analytics
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3 p-4 bg-background/30 rounded-xl border border-border/40">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Utilization Rate</p>
                <p className="text-3xl font-mono font-bold text-data-positive">67%</p>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide">Optimal range</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">ETH Pool</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">USDC Pool</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-base font-mono tracking-wide">BTC Pool</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-mono font-medium">Monitor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network & DMM Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="trading-panel">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <Network className="h-7 w-7 text-accent" />
              Network Metrics
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              Blockchain performance data
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 p-4 bg-background/30 rounded-xl border border-border/40 text-center">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Block Time</p>
                <p className="text-3xl font-mono font-bold">12.1s</p>
                <p className="text-sm font-mono text-data-positive uppercase tracking-wide">Normal</p>
              </div>
              <div className="space-y-3 p-4 bg-background/30 rounded-xl border border-border/40 text-center">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Gas Price</p>
                <p className="text-3xl font-mono font-bold">23 gwei</p>
                <p className="text-sm font-mono text-data-positive uppercase tracking-wide">Low</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">Transaction Success Rate</span>
                <span className="text-data-positive font-mono font-bold text-xl">99.7%</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-base font-mono tracking-wide">Network Congestion</span>
                <span className="text-data-positive font-mono font-medium">Low</span>
              </div>
            </div>
          </div>
        </div>

        <div className="trading-panel">
          <div className="mb-8">
            <h2 className="text-2xl font-mono font-bold uppercase tracking-wider flex items-center gap-3 mb-2">
              <Zap className="h-7 w-7 text-accent" />
              Service Status
            </h2>
            <p className="text-muted-foreground font-mono tracking-wide">
              DMM & bridge operational status
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">Dynamic Market Maker</span>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">Layer Zero Bridge</span>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Operational</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-border/30">
                <span className="text-base font-mono tracking-wide">Cross-chain Messaging</span>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-data-positive" />
                  <span className="text-data-positive font-mono font-medium">Online</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-background/30 rounded-xl border border-border/40">
              <div className="text-center space-y-2">
                <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">Bridge Volume (24h)</p>
                <p className="text-3xl font-mono font-bold text-data-positive">$2.3M</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
