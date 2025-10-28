import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import maangLogo from '@/assets/maang-logo.svg';

interface ShareTradeCardProps {
  isOpen: boolean;
  onClose: () => void;
  fromAsset: string;
  toAsset: string;
  amount: string;
}

export function ShareTradeCard({
  isOpen,
  onClose,
  fromAsset,
  toAsset,
  amount,
}: ShareTradeCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Just traded ${amount} ${fromAsset} for ${toAsset} on ETO! 🚀`;
  const shareUrl = 'https://eto.trade';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleShareDiscord = () => {
    // Discord doesn't have a direct share URL, so we'll copy the text
    handleCopy();
    toast.success('Message copied! Paste it in Discord');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Your Trade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img src={maangLogo} alt="MAANG" className="w-12 h-12" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">First Trade Complete! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  Just traded {amount} {fromAsset} for {toAsset} on ETO
                </p>
                <div className="text-xs text-primary font-mono pt-2">
                  eto.trade
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Share your success with the community
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleShareTwitter}
                className="w-full"
              >
                <span className="mr-2">𝕏</span>
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShareTelegram}
                className="w-full"
              >
                <span className="mr-2">✈️</span>
                Telegram
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShareDiscord}
                className="w-full"
              >
                <span className="mr-2">💬</span>
                Discord
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCopy}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="default"
            onClick={onClose}
            className="w-full"
          >
            Continue Trading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
