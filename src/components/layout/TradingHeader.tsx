import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Settings, Bell, BarChart3 } from "lucide-react";

export const TradingHeader = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight mono">ETO</h1>
            <Badge variant="outline" className="text-xs mono">TRADING</Badge>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Button variant="ghost" className="text-sm font-medium mono">
              Trade
            </Button>
            <Button variant="ghost" className="text-sm font-medium mono">
              Portfolio
            </Button>
            <Button variant="ghost" className="text-sm font-medium mono">
              Markets
            </Button>
            <Button variant="ghost" className="text-sm font-medium mono">
              Analytics
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm mono text-muted-foreground">
            ETH: <span className="text-data-positive">$2,341.67</span>
          </div>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button className="industrial-button">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
};