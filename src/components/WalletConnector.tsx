
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export function WalletConnector() {
  const { 
    walletAddress, 
    isConnecting, 
    error, 
    isMetaMaskInstalled, 
    connectWallet, 
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
        
        {!isMetaMaskInstalled && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-sm">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              MetaMask not detected. Please install MetaMask to continue.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <Button 
          onClick={connectWallet}
          disabled={!isMetaMaskInstalled || isConnecting}
          className="w-full"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>

        {!isMetaMaskInstalled && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Install MetaMask
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
