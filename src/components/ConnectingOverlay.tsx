import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export default function ConnectingOverlay() {
  const { isConnecting, isAutoConnecting, error, resetConnectionState } = useWallet();

  const visible = isConnecting || isAutoConnecting;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-background/60 backdrop-blur-sm flex items-center justify-center animate-fade-in" role="dialog" aria-modal>
      <div className="w-full max-w-sm border border-border bg-card rounded-lg shadow-xl p-6 animate-enter">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <div className="font-medium">{isAutoConnecting ? 'Restoring session…' : 'Connecting to wallet…'}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{isAutoConnecting ? 'Trying your last connected wallet' : 'Awaiting approval in your wallet'}</div>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-destructive">{error}</div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          {!isAutoConnecting && (
            <Button variant="outline" size="sm" onClick={resetConnectionState}>Cancel</Button>
          )}
        </div>
      </div>
    </div>
  );
}
