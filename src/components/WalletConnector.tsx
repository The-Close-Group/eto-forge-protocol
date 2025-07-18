
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet, WALLET_OPTIONS } from '@/hooks/useWallet';
import { WalletOption } from './WalletOption';

export function WalletConnector() {
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const { 
    walletAddress, 
    connectedWalletType,
    isConnecting, 
    error, 
    connectWallet,
    disconnectWallet 
  } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async (walletId: string) => {
    setConnectingWalletId(walletId);
    await connectWallet(walletId);
    setConnectingWalletId(null);
  };

  const getConnectedWalletInfo = () => {
    return WALLET_OPTIONS.find(w => w.id === connectedWalletType) || WALLET_OPTIONS[0];
  };

  if (walletAddress) {
    const connectedWallet = getConnectedWalletInfo();
    
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Wallet Connected</CardTitle>
          <CheckCircle className="h-6 w-6 text-green-400" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-sm">
            <div className="text-lg">{connectedWallet.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{connectedWallet.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {truncateAddress(walletAddress)}
              </div>
            </div>
            <Wallet className="h-4 w-4 text-muted-foreground" />
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

        <div className="grid grid-cols-2 gap-3">
          {WALLET_OPTIONS.map((wallet) => (
            <WalletOption
              key={wallet.id}
              wallet={wallet}
              isConnecting={isConnecting}
              connectingWalletId={connectingWalletId}
              onConnect={handleConnect}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          This is a demo interface. No actual wallet connection is made.
        </p>
      </CardContent>
    </Card>
  );
}
