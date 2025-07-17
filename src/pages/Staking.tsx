import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Activity, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowUpDown
} from "lucide-react";

export default function Staking() {
  const preMadeCombos = [
    { 
      name: "MAANG/USDC", 
      apy: "24.8%", 
      risk: "Medium", 
      minStake: "$1,000",
      description: "Balanced pair with MAANG growth potential"
    },
    { 
      name: "ETO/USDC", 
      apy: "18.5%", 
      risk: "Low", 
      minStake: "$500",
      description: "Platform token staking with stability"
    },
    { 
      name: "MAANG Solo", 
      apy: "15.2%", 
      risk: "High", 
      minStake: "$2,000",
      description: "Pure MAANG exposure for maximum growth"
    },
    { 
      name: "USDC Solo", 
      apy: "8.7%", 
      risk: "Low", 
      minStake: "$100",
      description: "Stable yield with USD backing"
    },
  ];

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Staking</h1>
        <p className="text-muted-foreground">
          Advanced asset pairing and yield optimization
        </p>
      </div>

      {/* Staking Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1 - Primary Asset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Asset Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Asset</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maang">MAANG</SelectItem>
                  <SelectItem value="eto">ETO</SelectItem>
                  <SelectItem value="btc">BTC</SelectItem>
                  <SelectItem value="eth">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="0.00" className="font-mono" />
                <Button variant="outline" size="sm">MAX</Button>
              </div>
              <p className="text-xs text-muted-foreground">Balance: 1,500.00 MAANG</p>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2 - Pairing Asset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Pairing Asset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pair With</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select pairing asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="maang">MAANG</SelectItem>
                  <SelectItem value="eto">ETO</SelectItem>
                  <SelectItem value="none">None (Solo Staking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="0.00" className="font-mono" />
                <Button variant="outline" size="sm">AUTO</Button>
              </div>
              <p className="text-xs text-muted-foreground">Balance: 2,840.50 USDC</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projected Yield */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Projected Yield
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent/20 rounded-sm">
              <p className="text-sm text-muted-foreground">Daily</p>
              <p className="text-xl font-mono font-bold">$12.47</p>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-sm">
              <p className="text-sm text-muted-foreground">Weekly</p>
              <p className="text-xl font-mono font-bold">$87.29</p>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-sm">
              <p className="text-sm text-muted-foreground">Monthly</p>
              <p className="text-xl font-mono font-bold">$374.10</p>
            </div>
            <div className="text-center p-4 bg-accent/20 rounded-sm">
              <p className="text-sm text-muted-foreground">APY</p>
              <p className="text-xl font-mono font-bold text-green-400">24.8%</p>
            </div>
          </div>
          <div className="mt-4">
            <Button className="w-full">Stake Assets</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pre-made Combos */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-made Combos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preMadeCombos.map((combo, index) => (
              <div key={index} className="p-4 border border-border rounded-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono font-semibold">{combo.name}</h3>
                    <p className="text-sm text-muted-foreground">{combo.description}</p>
                  </div>
                  <Badge variant={combo.risk === "Low" ? "secondary" : combo.risk === "Medium" ? "default" : "destructive"}>
                    {combo.risk}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">APY</p>
                    <p className="font-mono font-bold text-green-400">{combo.apy}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Min Stake</p>
                    <p className="font-mono">{combo.minStake}</p>
                  </div>
                  <Button size="sm">Select</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Protocol TVL</span>
                <span className="font-mono font-semibold">$47.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Stakers</span>
                <span className="font-mono font-semibold">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">System Utilization</span>
                <span className="font-mono font-semibold">78.4%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm">DMM Health: Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm">Network Status: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">Bridge Status: Maintenance</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Block Time</span>
                <span className="font-mono font-semibold">2.1s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Price</span>
                <span className="font-mono font-semibold">12 gwei</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-mono font-semibold text-green-400">99.7%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}