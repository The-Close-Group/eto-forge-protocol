import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InfoButtonProps {
  title: string;
  description: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InfoButton({ title, description, className, size = 'md' }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'rounded-full flex items-center justify-center',
          'bg-muted/50 hover:bg-muted border border-border/50',
          'text-muted-foreground hover:text-foreground',
          'transition-all duration-200 hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-primary/30',
          buttonSizes[size],
          className
        )}
        aria-label={`Info about ${title}`}
      >
        <Info className={iconSizes[size]} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" />
          
          {/* Content Card */}
          <div 
            className={cn(
              'relative z-10 w-full max-w-md',
              'bg-card border border-border/60 rounded-2xl',
              'shadow-2xl shadow-black/50',
              'animate-in zoom-in-95 fade-in duration-300 ease-out'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-[14px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Footer */}
            <div className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



