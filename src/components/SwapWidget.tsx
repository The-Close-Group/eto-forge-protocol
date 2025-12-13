import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { cn } from '@/lib/utils';

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

interface SwapWidgetProps {
  fromToken: string;
  toToken: string;
  fromBalance: string;
  toBalance: string;
  inputAmount: string;
  outputAmount: string;
  isReversed: boolean;
  isLoading: boolean;
  isApproving: boolean;
  isLoadingQuote: boolean;
  validationError: string;
  executionPrice: number;
  priceImpact: number;
  estimatedFee: number;
  slippage: number;
  onInputChange: (value: string) => void;
  onFlip: () => void;
  onSwap: () => void;
  onMaxClick: () => void;
}

// Plasma beam - valorant/hacker style, stays within trapezoid boundaries
function PlasmaBeam({ isActive, onComplete }: { isActive: boolean; onComplete: () => void }) {
  return (
    <AnimatePresence>
      {isActive && (
        <div className="absolute inset-x-16 top-[85px] bottom-[85px] z-30 pointer-events-none overflow-hidden">
          {/* Main plasma line */}
          <motion.div
            className="absolute left-0 right-0 h-[3px]"
            style={{ 
              background: 'linear-gradient(to right, transparent 5%, hsl(var(--primary)) 15%, hsl(var(--primary)) 85%, transparent 95%)',
              boxShadow: '0 0 15px 3px hsl(var(--primary) / 0.9), 0 0 30px 6px hsl(var(--primary) / 0.5)',
              filter: 'blur(0.5px)',
            }}
            initial={{ top: '-5%' }}
            animate={{ top: '105%' }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={onComplete}
          />
          
          {/* Glitch flicker lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-primary/60"
              style={{
                left: `${10 + i * 15}%`,
                right: `${10 + (2 - i) * 15}%`,
              }}
              initial={{ top: '-2%', opacity: 0 }}
              animate={{ 
                top: '102%',
                opacity: [0, 0.8, 0, 0.6, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
          
          {/* Data fragments - hacker vibe */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`frag-${i}`}
              className="absolute text-[8px] font-mono text-primary/70"
              style={{
                left: `${15 + (i % 3) * 30}%`,
              }}
              initial={{ top: '-3%', opacity: 0 }}
              animate={{ 
                top: '103%',
                opacity: [0, 1, 0.5, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {['0x', '>>>', '///'][i % 3]}
            </motion.div>
          ))}
          
          {/* Trailing glow */}
          <motion.div
            className="absolute left-0 right-0 h-12"
            style={{ 
              background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.2), transparent)',
            }}
            initial={{ top: '-10%' }}
            animate={{ top: '100%' }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

// Rolodex digit with flip animation
function RolodexDigit({ char, delay = 0 }: { char: string; delay?: number }) {
  const [displayChar, setDisplayChar] = useState(char);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevChar = useRef(char);

  useEffect(() => {
    if (char !== prevChar.current) {
      setIsFlipping(true);
      setTimeout(() => {
        setDisplayChar(char);
      }, 120 + delay);
      setTimeout(() => {
        setIsFlipping(false);
        prevChar.current = char;
      }, 240 + delay);
    }
  }, [char, delay]);

  return (
    <span className="relative inline-block overflow-hidden h-[1.15em]">
      <motion.span
        className="inline-block"
        animate={{
          rotateX: isFlipping ? [-0, -90, 0] : 0,
          y: isFlipping ? [0, -3, 0] : 0,
        }}
        transition={{ duration: 0.24, delay: delay / 1000, ease: [0.4, 0, 0.2, 1] }}
      >
        {displayChar}
      </motion.span>
    </span>
  );
}

// Animated number display
function RolodexNumber({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      {value.split('').map((char, i) => (
        <RolodexDigit key={i} char={char} delay={i * 25} />
      ))}
    </span>
  );
}

export function SwapWidget({
  fromToken,
  toToken,
  fromBalance,
  inputAmount,
  outputAmount,
  isLoading,
  isApproving,
  isLoadingQuote,
  validationError,
  executionPrice,
  priceImpact,
  onInputChange,
  onFlip,
  onSwap,
}: SwapWidgetProps) {
  const account = useActiveAccount();
  const [isFlipping, setIsFlipping] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pendingSwap, setPendingSwap] = useState(false);
  const isProcessing = isLoading || isApproving;

  const handleFlip = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      onFlip();
    }, 250);
    setTimeout(() => setIsFlipping(false), 500);
  }, [onFlip]);

  useEffect(() => {
    setShowDetails(!!inputAmount && parseFloat(inputAmount) > 0 && !validationError);
  }, [inputAmount, validationError]);

  // Handle swap with scanner animation
  const handleSwapClick = useCallback(() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0 || isLoading || isApproving || validationError) return;
    
    // Start scanner, delay actual swap
    setIsScanning(true);
    setPendingSwap(true);
  }, [inputAmount, isLoading, isApproving, validationError]);

  // When scanner completes, execute the swap
  const handleScanComplete = useCallback(() => {
    setIsScanning(false);
    if (pendingSwap) {
      setPendingSwap(false);
      onSwap();
    }
  }, [pendingSwap, onSwap]);

  return (
    <div className="relative w-full max-w-[520px] mx-auto flex items-center justify-center">
      <div className="relative overflow-hidden w-full">
        
        {/* Plasma beam - fires on swap, valorant/hacker style */}
        <PlasmaBeam isActive={isScanning} onComplete={handleScanComplete} />

        {/* ═══════════════════════════════════════════════════════════════
            TOP CHAMBER - Trapezoid wider at top, narrows toward center
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative"
          style={{ transformOrigin: 'center bottom' }}
          animate={{
            rotateX: isFlipping ? 90 : 0,
            opacity: isFlipping ? 0.3 : 1,
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Trapezoid SVG frame */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 520 220"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 10,10 L 510,10 L 440,210 L 80,210 Z"
              stroke="hsl(var(--foreground) / 0.3)"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              fill="none"
            />
          </svg>
          
          <div className="relative px-20 pt-10 pb-12">
            {/* Label */}
            <div className="text-center mb-5">
              <span className="text-xs uppercase tracking-[0.35em] text-foreground/60">
                You Pay
              </span>
            </div>
            
            {/* Value container - hexagonal feel */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Hex-ish border */}
                <svg className="absolute -inset-2" viewBox="0 0 300 100" fill="none">
                  <path
                    d="M 15,0 L 285,0 L 300,15 L 300,85 L 285,100 L 15,100 L 0,85 L 0,15 Z"
                    stroke="hsl(var(--foreground) / 0.35)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                
                <div className="relative px-12 py-6 min-w-[280px]">
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={inputAmount}
                      onChange={(e) => onInputChange(e.target.value)}
                      className={cn(
                        "w-full bg-transparent text-center text-4xl font-semibold outline-none placeholder:text-foreground/20",
                        "text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        validationError && "text-destructive"
                      )}
                    />
                    <span className="text-sm text-foreground/70 uppercase tracking-[0.2em]">
                      {fromToken}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fill bar */}
            <div className="mt-5 mx-auto w-[220px]">
              <div className="h-1 bg-primary/15 overflow-hidden rounded-full">
                <motion.div 
                  className="h-full bg-primary"
                  animate={{ 
                    width: inputAmount && parseFloat(fromBalance) > 0 
                      ? `${Math.min((parseFloat(inputAmount) / parseFloat(fromBalance)) * 100, 100)}%` 
                      : '0%' 
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            SWAP AXIS - The narrow waist / pivot point
            ═══════════════════════════════════════════════════════════════ */}
        <div className="relative h-14 flex items-center justify-center">
          {/* Converging lines to center */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
            <div 
              className="flex-1 h-px ml-20"
              style={{ background: 'linear-gradient(to right, transparent 0%, hsl(var(--foreground) / 0.2) 100%)' }}
            />
            <div className="w-36" />
            <div 
              className="flex-1 h-px mr-20"
              style={{ background: 'linear-gradient(to left, transparent 0%, hsl(var(--foreground) / 0.2) 100%)' }}
            />
          </div>
          
          {/* Axis button */}
          <motion.button
            onClick={handleFlip}
            className="relative z-10 flex items-center gap-3 px-5 py-2 bg-background border border-foreground/25 group"
            whileHover={{ scale: 1.03, borderColor: 'hsl(var(--primary) / 0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.span 
              className="text-foreground/60 text-sm"
              animate={{ x: isFlipping ? 4 : 0 }}
              transition={{ duration: 0.15 }}
            >
              ‹
            </motion.span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/70 group-hover:text-primary transition-colors font-medium">
              Swap
            </span>
            <motion.span 
              className="text-foreground/60 text-sm"
              animate={{ x: isFlipping ? -4 : 0 }}
              transition={{ duration: 0.15 }}
            >
              ›
            </motion.span>
          </motion.button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            BOTTOM CHAMBER - Inverted trapezoid, narrow at top, wider at bottom
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative"
          style={{ transformOrigin: 'center top' }}
          animate={{
            rotateX: isFlipping ? -90 : 0,
            opacity: isFlipping ? 0.3 : 1,
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Inverted trapezoid SVG frame */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 520 220"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 80,10 L 440,10 L 510,210 L 10,210 Z"
              stroke="hsl(var(--primary) / 0.7)"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              fill="none"
            />
          </svg>
          
          {/* Liquid fill during processing */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                className="absolute bottom-0 left-[60px] right-[60px] bg-primary/8 z-0"
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                exit={{ height: 0 }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                style={{ 
                  clipPath: 'polygon(13% 0%, 87% 0%, 100% 100%, 0% 100%)'
                }}
              />
            )}
          </AnimatePresence>
          
          <div className="relative px-20 pt-12 pb-10">
            {/* Value container */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Hex-ish border - primary colored */}
                <svg className="absolute -inset-2" viewBox="0 0 300 100" fill="none">
                  <path
                    d="M 15,0 L 285,0 L 300,15 L 300,85 L 285,100 L 15,100 L 0,85 L 0,15 Z"
                    stroke="hsl(var(--primary) / 0.7)"
                    strokeWidth="1.5"
                    fill="hsl(var(--primary) / 0.1)"
                  />
                </svg>
                
                <div className="relative px-12 py-6 min-w-[280px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "text-4xl font-semibold flex items-center gap-2",
                      isLoadingQuote && inputAmount && "opacity-40",
                      parseFloat(outputAmount) > 0 ? "text-primary" : "text-foreground/20"
                    )}>
                      {isLoadingQuote && inputAmount && (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      )}
                      <RolodexNumber value={outputAmount || '0.000000'} />
                    </div>
                    <span className="text-sm text-primary font-medium uppercase tracking-[0.2em]">
                      {toToken}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="text-center mt-5">
              <span className="text-xs uppercase tracking-[0.35em] text-foreground/60">
                You Receive
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            TRANSACTION DETAILS
            ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-16"
            >
              <div className="border-t border-foreground/15 pt-5 pb-2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60 uppercase tracking-[0.15em]">Rate</span>
                  <span className="text-foreground/80 font-mono">1 {toToken} = ${executionPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60 uppercase tracking-[0.15em]">Impact</span>
                  <span className={cn("font-mono", priceImpact > 3 ? 'text-yellow-400' : 'text-primary')}>
                    ~{priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60 uppercase tracking-[0.15em]">Gas</span>
                  <span className="text-primary flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5" /> Sponsored
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Error */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-10 pb-3"
            >
              <div className="flex items-center gap-2 py-2 text-[10px] font-mono text-red-400/80">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">{validationError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════
            ACTION BUTTON
            ═══════════════════════════════════════════════════════════════ */}
        <div className="px-16 pb-8 pt-4">
          {!account ? (
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={etoMainnet}
              chains={supportedChains}
              connectModal={{ size: "compact" }}
              connectButton={{
                label: "Connect Wallet",
                style: {
                  width: "100%",
                  background: "transparent",
                  color: "rgba(255, 255, 255, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0",
                  padding: "14px",
                  fontSize: "10px",
                  fontWeight: "400",
                  fontFamily: "ui-monospace, monospace",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                },
              }}
            />
          ) : (
            <motion.button
              onClick={handleSwapClick}
              disabled={!inputAmount || parseFloat(inputAmount) <= 0 || isLoading || isApproving || !!validationError || isScanning}
              className={cn(
                "w-full py-4 text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden font-medium",
                "border",
                validationError || !inputAmount || parseFloat(inputAmount) <= 0
                  ? "border-foreground/10 text-foreground/30 cursor-not-allowed"
                  : isProcessing || isScanning
                    ? "border-primary text-primary bg-primary/10"
                    : "border-primary/50 text-primary hover:border-primary hover:bg-primary/10"
              )}
              whileHover={!validationError && inputAmount && parseFloat(inputAmount) > 0 && !isProcessing ? { scale: 1.005 } : {}}
              whileTap={!validationError && inputAmount && parseFloat(inputAmount) > 0 && !isProcessing ? { scale: 0.995 } : {}}
            >
              {/* Processing sweep animation */}
              {isProcessing && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              )}
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isScanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scanning...
                  </>
                ) : isApproving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Approving...
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  `Swap ${fromToken} → ${toToken}`
                )}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SwapWidget;
