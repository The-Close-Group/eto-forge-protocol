
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { ConnectButton } from "thirdweb/react";
import { client } from '@/lib/thirdweb';
import { createWallet } from "thirdweb/wallets";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

export function WalletConnector() {
  const { 
    walletAddress, 
    isConnecting, 
    error, 
    disconnectWallet 
  } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletAddress) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Wallet Connected</CardTitle>
          <CheckCircle className="h-6 w-6 text-green-400" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-sm">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{truncateAddress(walletAddress)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View on Etherscan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your wallet to access trading features and manage your portfolio.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <div className="w-full">
          <ConnectButton
            client={client}
            wallets={wallets}
            theme="dark"
            connectButton={{
              style: {
                backgroundColor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "calc(var(--radius) - 4px)",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "8px 16px",
                width: "100%",
                minHeight: "40px"
              }
            }}
            connectModal={{
              size: "compact",
              title: "Connect Wallet",
              showThirdwebBranding: false,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
