
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, ExternalLink, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type TransactionStep = 'approve' | 'swap' | 'confirm';
export type TransactionStatus = 'pending' | 'success' | 'error';

interface TransactionStatusProps {
  isOpen: boolean;
  onClose: () => void;
  status: TransactionStatus;
  currentStep: TransactionStep;
  transactionHash?: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  error?: string;
}

const STEPS: { id: TransactionStep; label: string; description: string }[] = [
  { id: 'approve', label: 'Approve Token', description: 'Approve spending of your tokens' },
  { id: 'swap', label: 'Execute Swap', description: 'Execute the token swap' },
  { id: 'confirm', label: 'Confirm', description: 'Transaction confirmed on blockchain' }
];

export function TransactionStatus({
  isOpen,
  onClose,
  status,
  currentStep,
  transactionHash,
  fromAsset,
  toAsset,
  fromAmount,
  toAmount,
  error
}: TransactionStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);

  const copyTransactionHash = () => {
    if (transactionHash) {
      navigator.clipboard.writeText(transactionHash);
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard"
      });
    }
  };

  const viewOnExplorer = () => {
    if (transactionHash) {
      window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank');
    }
  };

  const handleDialogClose = () => {
    if (status !== 'pending') {
      onClose();
    }
  };

  const totalCost = `≈ $${(parseFloat(fromAmount || "0") * 1.003 + 2.5).toFixed(2)}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 font-mono">
            {status === 'pending' && <Clock className="h-5 w-5 text-primary animate-pulse" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-data-positive" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
            {status === 'pending' && 'Transaction in Progress'}
            {status === 'success' && 'Transaction Successful'}
            {status === 'error' && 'Transaction Failed'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trade Summary */}
          <Card className="border-primary/20 bg-accent/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-medium font-mono">{fromAmount}</div>
                  <div className="text-sm text-muted-foreground font-mono">{fromAsset}</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground font-mono">SWAP</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium font-mono">{toAmount}</div>
                  <div className="text-sm text-muted-foreground font-mono">{toAsset}</div>
                </div>
              </div>
              
              {status === 'success' && (
                <div className="pt-3 border-t border-border mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-mono">Total Cost</span>
                    <span className="text-sm font-medium font-mono">{totalCost}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Steps */}
          {status === 'pending' && (
            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-sm border ${
                      isActive ? 'bg-primary/10 border-primary/20' :
                      isCompleted ? 'bg-data-positive/10 border-data-positive/20' :
                      'bg-muted/30 border-border'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-medium font-mono ${
                      isActive ? 'bg-primary text-primary-foreground' :
                      isCompleted ? 'bg-data-positive text-data-positive-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isActive ? (
                        <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm font-mono">{step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                );
              })}
              
              <div className="text-center text-sm text-muted-foreground font-mono">
                Elapsed time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-data-positive/10 rounded-sm border border-data-positive/20">
                <div className="text-sm text-data-positive font-medium font-mono">
                  Your swap was completed successfully!
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Transaction confirmed on blockchain
                </div>
              </div>

              {transactionHash && (
                <div className="space-y-2">
                  <div className="text-sm font-medium font-mono">Transaction Hash</div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm border border-border">
                    <div className="font-mono text-xs text-muted-foreground flex-1 truncate">
                      {transactionHash}
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyTransactionHash}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={viewOnExplorer}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-sm border border-destructive/20">
                <div className="text-sm text-destructive font-medium font-mono mb-2">
                  Transaction Failed
                </div>
                <div className="text-sm text-muted-foreground">
                  {error || 'An unexpected error occurred. Please try again.'}
                </div>
              </div>

              {transactionHash && (
                <div className="space-y-2">
                  <div className="text-sm font-medium font-mono">Failed Transaction Hash</div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm border border-border">
                    <div className="font-mono text-xs text-muted-foreground flex-1 truncate">
                      {transactionHash}
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyTransactionHash}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={viewOnExplorer}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {status === 'pending' && (
              <Button variant="outline" className="flex-1 font-mono" disabled>
                Please wait...
              </Button>
            )}
            {status !== 'pending' && (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1 font-mono">
                  Close
                </Button>
                {status === 'error' && (
                  <Button onClick={onClose} className="flex-1 font-mono">
                    Try Again
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
