
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
    <Card className="border-border bg-card hover:bg-accent/10 transition-all duration-200 cursor-pointer group w-full">
      <CardContent className="p-0">
        <Button
          variant="ghost"
          className="w-full h-auto p-6 flex items-center justify-start gap-4 hover:bg-transparent group-hover:bg-accent/5 transition-colors"
          onClick={() => onConnect(wallet.id)}
          disabled={isConnecting}
        >
          <div className="text-4xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
            {wallet.icon}
          </div>
          <div className="flex-1 text-left space-y-1">
            <div className="font-medium text-base uppercase tracking-wider text-foreground">
              {wallet.name}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {wallet.description}
            </div>
          </div>
          {isThisWalletConnecting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting...</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
