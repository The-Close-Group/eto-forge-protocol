
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet, WALLET_OPTIONS } from '@/hooks/useWallet';
import { WalletOption } from './WalletOption';
import { useAuth } from '@/contexts/AuthContext';

export function WalletConnector() {
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const { signOut } = useAuth();
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

  const handleDisconnect = async () => {
    await disconnectWallet();
    signOut();
  };

  const getConnectedWalletInfo = () => {
    return WALLET_OPTIONS.find(w => w.id === connectedWalletType) || WALLET_OPTIONS[0];
  };

  if (walletAddress) {
    const connectedWallet = getConnectedWalletInfo();
    
    return (
      <Card className="border-border bg-card w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-medium">Wallet Connected</CardTitle>
          <CheckCircle className="h-6 w-6 text-green-400" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-sm">
            <div className="text-2xl">{connectedWallet.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-base">{connectedWallet.name}</div>
              <div className="font-mono text-sm text-muted-foreground mt-1">
                {truncateAddress(walletAddress)}
              </div>
            </div>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="default" onClick={handleDisconnect} className="flex-1">
              Disconnect
            </Button>
            <Button 
              variant="ghost" 
              size="default"
              onClick={() => window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Etherscan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card w-full max-w-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium text-center">Connect Wallet</CardTitle>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Choose your preferred wallet to connect to the ETO Trading platform
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-sm">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <div className="space-y-3">
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

        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This is a demo interface. No actual wallet connection is made.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
