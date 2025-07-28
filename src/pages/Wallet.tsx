
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, Send, Download, Copy, ExternalLink, Circle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Link } from "react-router-dom";

export default function Wallet() {
  const { walletAddress, connectedWalletType } = useWallet();

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "0.00", value: "$0.00", icon: "🔵" },
    { symbol: "USDC", name: "USD Coin", balance: "0.00", value: "$0.00", icon: "💵" },
    { symbol: "BTC", name: "Bitcoin", balance: "0.00", value: "$0.00", icon: "₿" },
    { symbol: "MAANG", name: "MAANG Token", balance: "0.00", value: "$0.00", icon: "🏢" },
  ];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="p-6 pb-20 md:pb-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your digital assets and transactions
        </p>
      </div>

      {/* Wallet Overview */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <WalletIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Connected Wallet</CardTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {walletAddress ? truncateAddress(walletAddress) : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Circle className="h-2 w-2 fill-green-400 text-green-400" />
              Ethereum
            </Badge>
            {connectedWalletType && (
              <Badge variant="secondary" className="capitalize">
                {connectedWalletType}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-mono mb-2">$0.00</div>
          <p className="text-muted-foreground mb-6">Total Portfolio Value</p>
          
          <div className="flex gap-3">
            <Button className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Receive
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => alert("Send functionality - Connect to your wallet to send tokens")}>
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              if (walletAddress) {
                navigator.clipboard.writeText(walletAddress);
                alert("Address copied to clipboard!");
              }
            }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Token Balances</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/assets">View All Assets</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-lg">
                  {token.icon}
                </div>
                <div>
                  <p className="font-medium font-mono">{token.symbol}</p>
                  <p className="text-sm text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">{token.balance}</p>
                <p className="text-sm text-muted-foreground">{token.value}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-4 text-center">
            <p className="text-muted-foreground mb-4">No tokens in your wallet yet</p>
            <Button asChild className="w-full">
              <Link to="/trade">Buy Your First Asset</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.open("https://etherscan.io", "_blank")}>
            View All
            <ExternalLink className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/30 rounded-sm flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Your transaction history will appear here once you start trading
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
