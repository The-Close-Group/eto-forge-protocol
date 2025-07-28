
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      case "optimal": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "critical": return "text-red-400";
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

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-mono uppercase tracking-wider mb-2">System Health</h1>
        <p className="text-muted-foreground font-mono">Real-time monitoring of ETO platform metrics</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Shield className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">98.7%</div>
            <p className="text-xs text-muted-foreground">System operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Protocols</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Cross-chain networks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">99.97%</div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>
      </div>

      {/* Peg Integrity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Peg Integrity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">MAANG/USDC</span>
                <Badge variant="outline" className="text-green-400 border-green-400">OPTIMAL</Badge>
              </div>
              <div className="text-lg font-bold">0.02%</div>
              <p className="text-xs text-muted-foreground">Deviation from peg</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ETH/USD</span>
                <Badge variant="outline" className="text-green-400 border-green-400">OPTIMAL</Badge>
              </div>
              <div className="text-lg font-bold">0.05%</div>
              <p className="text-xs text-muted-foreground">Deviation from peg</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">BTC/USD</span>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">WATCH</Badge>
              </div>
              <div className="text-lg font-bold">0.12%</div>
              <p className="text-xs text-muted-foreground">Deviation from peg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking & Pool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tracking Percentage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Asset Tracking Accuracy</span>
                <span className="text-green-400 font-bold">99.8%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '99.8%' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Price Feed Reliability</span>
                <span className="text-green-400 font-bold">99.95%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '99.95%' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Oracle Sync Rate</span>
                <span className="text-green-400 font-bold">100%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pool Size Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Liquidity</p>
                <p className="text-lg font-bold">$45.7M</p>
                <p className="text-xs text-green-400">+12.3% today</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Utilization Rate</p>
                <p className="text-lg font-bold text-green-400">67%</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">ETH Pool</span>
                <span className="text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">USDC Pool</span>
                <span className="text-green-400">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">BTC Pool</span>
                <span className="text-yellow-400">Monitor</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network & DMM Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Block Time</p>
                <p className="text-lg font-bold">12.1s</p>
                <p className="text-xs text-green-400">Normal</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Gas Price</p>
                <p className="text-lg font-bold">23 gwei</p>
                <p className="text-xs text-green-400">Low</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Transaction Success Rate</span>
                <span className="text-green-400 font-bold">99.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Network Congestion</span>
                <span className="text-green-400">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              DMM & Bridge Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Dynamic Market Maker</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Active</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Layer Zero Bridge</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Operational</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Cross-chain Messaging</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Online</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex justify-between">
                <span className="text-sm">Bridge Volume (24h)</span>
                <span className="text-green-400 font-bold">$2.3M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
