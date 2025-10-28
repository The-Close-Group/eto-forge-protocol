import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
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
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `Just traded ${amount} ${fromAsset} for ${toAsset} on ETO! 🚀`;
  const shareUrl = 'https://eto.trade';

  const handleExportImage = async () => {
    if (!cardRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1a1a1a',
        scale: 2,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `eto-trade-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

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
          <div ref={cardRef} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src={maangLogo} alt="ETO" className="w-16 h-16" />
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">First Trade Complete! 🎉</h2>
              <div className="bg-black/30 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-400">Trade Details</p>
                <p className="text-xl font-bold text-white font-mono">
                  {amount} {fromAsset} → {toAsset}
                </p>
                <p className="text-xs text-gray-500">on ETO Exchange</p>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-primary font-mono text-sm">eto.trade</p>
              </div>
            </div>
          </div>

          {/* Export Image Button */}
          <Button
            variant="positive"
            onClick={handleExportImage}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              'Generating Image...'
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </>
            )}
          </Button>

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
