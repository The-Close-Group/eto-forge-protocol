
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { WalletOption as WalletOptionType } from '@/hooks/useWallet';

interface WalletOptionProps {
  wallet: WalletOptionType;
  isConnecting: boolean;
  connectingWalletId: string | null;
  onConnect: (walletId: string) => void;
}

export function WalletOption({ wallet, isConnecting, connectingWalletId, onConnect }: WalletOptionProps) {
  const isThisWalletConnecting = isConnecting && connectingWalletId === wallet.id;

  return (
    <Card className="border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer group">
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full h-auto p-0 flex flex-col items-center gap-3 hover:bg-transparent"
          onClick={() => onConnect(wallet.id)}
          disabled={isConnecting}
        >
          <div className="text-3xl group-hover:scale-110 transition-transform">
            {wallet.icon}
          </div>
          <div className="text-center space-y-1">
            <div className="font-medium text-sm uppercase tracking-wider">
              {wallet.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {wallet.description}
            </div>
          </div>
          {isThisWalletConnecting && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Connecting...
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
