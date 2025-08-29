
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
    <Card className="border-border bg-card hover:bg-accent/10 transition-colors cursor-pointer group w-full">
      <CardContent className="p-0">
        <Button
          variant="ghost"
          className="w-full h-auto p-4 flex items-center justify-start gap-3 hover:bg-transparent group-hover:bg-accent/5 transition-colors min-h-[4rem]"
          onClick={() => onConnect(wallet.id)}
          disabled={isConnecting}
        >
          <div className="text-2xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0 min-w-[2rem]">
            {wallet.icon}
          </div>
          <div className="flex-1 text-left space-y-1 min-w-0">
            <div className="font-medium text-sm text-foreground truncate">
              {wallet.name}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {wallet.description}
            </div>
          </div>
          {isThisWalletConnecting && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0 min-w-0">
              <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
              <span className="hidden sm:inline">Connecting...</span>
              <span className="sm:hidden">...</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
