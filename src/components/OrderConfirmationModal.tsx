
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, AlertTriangle, Clock, Zap, Shield, Loader2 } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  exchangeRate: string;
  networkFee: string;
  platformFee: string;
  priceImpact: number;
  estimatedTime: string;
  totalCost: string;
  isConfirming?: boolean;
}

export function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  fromAsset,
  toAsset,
  fromAmount,
  toAmount,
  exchangeRate,
  networkFee,
  platformFee,
  priceImpact,
  estimatedTime,
  totalCost,
  isConfirming = false
}: OrderConfirmationModalProps) {
  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);
  const showPriceImpactWarning = parseFloat(fromAmount) > 10000;
  const showHighImpactWarning = Math.abs(priceImpact) > 5;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Confirm Your Trade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trade Overview */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-medium font-mono">{fromAmount}</div>
                    <div className="text-sm text-muted-foreground">{fromAsset}</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">SWAP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium font-mono">{toAmount}</div>
                    <div className="text-sm text-muted-foreground">{toAsset}</div>
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  Rate: {exchangeRate}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <div className="space-y-2 p-3 bg-accent/30 rounded-sm">
            <div className="flex justify-between text-sm">
              <span>Network Fee</span>
              <span className="font-mono">{networkFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ETO Fee</span>
              <span className="font-mono">{platformFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Price Impact</span>
              <span className={`font-mono ${
                Math.abs(priceImpact) > 3 ? 'text-warning' : 'text-data-positive'
              }`}>
                {priceImpact >= 0 ? '+' : ''}{priceImpact}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Est. Time
              </span>
              <span className="font-mono">{estimatedTime}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total Cost</span>
              <span className="font-mono">{totalCost}</span>
            </div>
          </div>

          {/* Warnings */}
          {(showPriceImpactWarning || showHighImpactWarning) && (
            <div className="space-y-3">
              {showPriceImpactWarning && (
                <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-sm">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Large Trade Warning</p>
                    <p className="text-muted-foreground">This large trade may affect market prices</p>
                  </div>
                </div>
              )}

              {showHighImpactWarning && (
                <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">High Price Impact</p>
                    <p className="text-muted-foreground">Price impact exceeds 5%. Consider smaller amounts.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accept-warning"
                  checked={hasAcceptedWarning}
                  onChange={(e) => setHasAcceptedWarning(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="accept-warning" className="text-sm text-muted-foreground">
                  I understand the risks and want to proceed
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isConfirming}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              disabled={
                isConfirming || 
                ((showPriceImpactWarning || showHighImpactWarning) && !hasAcceptedWarning)
              }
            >
              {isConfirming ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Confirm Trade
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
