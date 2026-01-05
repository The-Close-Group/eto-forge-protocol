import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronDown, 
  ChevronUp,
  Plus,
  ArrowUpDown,
  Info,
  AlertTriangle,
  Settings2,
} from 'lucide-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { client, etoMainnet, supportedChains } from '@/lib/thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { toast } from 'sonner';

type OrderSide = 'long' | 'short';
type OrderType = 'market' | 'limit' | 'stop';

interface TradePanelProps {
  symbol?: string;
  currentPrice?: number;
  onTrade?: (trade: TradeOrder) => void;
}

interface TradeOrder {
  side: OrderSide;
  type: OrderType;
  collateral: number;
  leverage: number;
  size: number;
  takeProfit?: number;
  stopLoss?: number;
  limitPrice?: number;
  stopPrice?: number;
}

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

const LEVERAGE_PRESETS = [1, 10, 25, 50, 75, 100];

export function TradePanel({ 
  symbol = 'MAANG', 
  currentPrice = 6844.78,
  onTrade,
}: TradePanelProps) {
  const account = useActiveAccount();
  
  // Order state
  const [side, setSide] = useState<OrderSide>('long');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [collateral, setCollateral] = useState<string>('100');
  const [leverage, setLeverage] = useState<number>(10);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpPercent, setTpPercent] = useState<number>(900);
  const [slPercent, setSlPercent] = useState<number>(0);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(1);
  
  // Mock balance
  const availableBalance = 1250.00;
  
  // Calculations
  const collateralNum = parseFloat(collateral) || 0;
  const estimatedSize = useMemo(() => {
    if (!collateralNum || !currentPrice) return 0;
    return (collateralNum * leverage) / currentPrice;
  }, [collateralNum, leverage, currentPrice]);
  
  const exposure = useMemo(() => collateralNum * leverage, [collateralNum, leverage]);
  
  const liquidationPrice = useMemo(() => {
    if (!currentPrice || !leverage || !collateralNum) return 0;
    const moveToLiq = 1 / leverage;
    return side === 'long' 
      ? currentPrice * (1 - moveToLiq * 0.9) 
      : currentPrice * (1 + moveToLiq * 0.9);
  }, [currentPrice, leverage, side, collateralNum]);
  
  const takeProfitPrice = useMemo(() => {
    if (!tpEnabled || !currentPrice) return null;
    const move = (tpPercent / 100) / leverage;
    return side === 'long' 
      ? currentPrice * (1 + move) 
      : currentPrice * (1 - move);
  }, [tpEnabled, tpPercent, currentPrice, leverage, side]);
  
  const stopLossPrice = useMemo(() => {
    if (!slEnabled || !currentPrice || slPercent === 0) return null;
    const move = (slPercent / 100) / leverage;
    return side === 'long' 
      ? currentPrice * (1 - move) 
      : currentPrice * (1 + move);
  }, [slEnabled, slPercent, currentPrice, leverage, side]);

  // Fees
  const openFee = 0.05;
  const closeFee = 0.02;
  const spreadBps = 0.0044;

  const handleSubmit = () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }
    if (collateralNum <= 0) {
      toast.error('Please enter collateral amount');
      return;
    }
    if (collateralNum > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    const order: TradeOrder = {
      side,
      type: orderType,
      collateral: collateralNum,
      leverage,
      size: estimatedSize,
      takeProfit: takeProfitPrice || undefined,
      stopLoss: stopLossPrice || undefined,
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
    };

    onTrade?.(order);
    toast.success(`${side.toUpperCase()} order placed: ${estimatedSize.toFixed(6)} ${symbol}`);
  };

  const entryPrice = side === 'long' 
    ? currentPrice * 1.0001 
    : currentPrice * 0.9999;

  return (
    <div className="trade-panel">
      {/* Long/Short Toggle */}
      <div className="trade-panel-header">
        <button
          className={`trade-side-btn ${side === 'long' ? 'active long' : ''}`}
          onClick={() => setSide('long')}
        >
          <div className="trade-side-label">Long</div>
          <div className="trade-side-price">{entryPrice.toFixed(2)}</div>
        </button>
        <button
          className={`trade-side-btn ${side === 'short' ? 'active short' : ''}`}
          onClick={() => setSide('short')}
        >
          <div className="trade-side-label">Short</div>
          <div className="trade-side-price">{(currentPrice * 0.9999).toFixed(2)}</div>
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="trade-order-types">
        {(['market', 'limit', 'stop'] as OrderType[]).map((type) => (
          <button
            key={type}
            className={`trade-order-type ${orderType === type ? 'active' : ''}`}
            onClick={() => setOrderType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Available Balance */}
      <div className="trade-available">
        <span className="trade-available-label">Available to Trade</span>
        <div className="trade-available-value">
          <span className={availableBalance < 0 ? 'text-data-negative' : ''}>
            {availableBalance.toFixed(2)} USDC
          </span>
          <button className="trade-deposit-btn">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Main Trading Form */}
      <div className="trade-form">
        {/* Collateral Input */}
        <div className="trade-input-group">
          <div className="trade-input-row">
            <Label className="trade-input-label">Collateral</Label>
            <div className="trade-input-badge">
              <span className="trade-currency-icon">$</span>
              USDC
            </div>
          </div>
          <Input
            type="number"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            placeholder="0.00"
            className="trade-input"
          />
        </div>

        {/* Estimated Size */}
        <div className="trade-input-group">
          <div className="trade-input-row">
            <Label className="trade-input-label">Estimated Size</Label>
            <div className="trade-input-badge">
              <ArrowUpDown size={12} />
              {symbol}
            </div>
          </div>
          <div className="trade-size-display">
            {estimatedSize.toFixed(6)}
          </div>
        </div>

        {/* Leverage Slider */}
        <div className="trade-input-group">
          <div className="trade-input-row">
            <Label className="trade-input-label">Leverage</Label>
            <span className="trade-leverage-value">{leverage}x</span>
          </div>
          <Slider
            value={[leverage]}
            onValueChange={([val]) => setLeverage(val)}
            min={1}
            max={100}
            step={1}
            className="trade-leverage-slider"
          />
          <div className="trade-leverage-presets">
            {LEVERAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                className={`trade-leverage-preset ${leverage === preset ? 'active' : ''}`}
                onClick={() => setLeverage(preset)}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        {/* Limit/Stop Price */}
        {orderType === 'limit' && (
          <div className="trade-input-group">
            <Label className="trade-input-label">Limit Price</Label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className="trade-input"
            />
          </div>
        )}
        {orderType === 'stop' && (
          <div className="trade-input-group">
            <Label className="trade-input-label">Stop Price</Label>
            <Input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className="trade-input"
            />
          </div>
        )}
      </div>

      {/* TP/SL Section */}
      <div className="trade-tpsl">
        <button 
          className="trade-tpsl-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="flex items-center gap-2">
            <span className={`trade-tpsl-indicator ${tpEnabled ? 'tp-active' : ''}`}>
              TP {tpEnabled ? `${tpPercent}%` : 'None'}
            </span>
            <span className="trade-tpsl-divider">/</span>
            <span className={`trade-tpsl-indicator ${slEnabled ? 'sl-active' : ''}`}>
              SL {slEnabled && slPercent > 0 ? `${slPercent}%` : 'None'}
            </span>
          </span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="trade-tpsl-content">
            {/* Take Profit */}
            <div className="trade-tpsl-row">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Take Profit</Label>
                <Switch
                  checked={tpEnabled}
                  onCheckedChange={setTpEnabled}
                  className="scale-75"
                />
              </div>
              {tpEnabled && (
                <div className="trade-tpsl-input-row">
                  <Input
                    type="number"
                    value={tpPercent}
                    onChange={(e) => setTpPercent(parseFloat(e.target.value) || 0)}
                    className="trade-tpsl-input"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  {takeProfitPrice && (
                    <span className="text-xs text-data-positive ml-2">
                      @ ${takeProfitPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Stop Loss */}
            <div className="trade-tpsl-row">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Stop Loss</Label>
                <Switch
                  checked={slEnabled}
                  onCheckedChange={setSlEnabled}
                  className="scale-75"
                />
              </div>
              {slEnabled && (
                <div className="trade-tpsl-input-row">
                  <Input
                    type="number"
                    value={slPercent}
                    onChange={(e) => setSlPercent(parseFloat(e.target.value) || 0)}
                    className="trade-tpsl-input"
                    min={0}
                    max={100}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  {stopLossPrice && (
                    <span className="text-xs text-data-negative ml-2">
                      @ ${stopLossPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Margin Button */}
      <button className="trade-add-margin">
        Add more margin
      </button>

      {/* Trading Info */}
      <div className="trade-info">
        <div className="trade-info-row">
          <span className="trade-info-label underline decoration-dotted cursor-help">Slippage Tolerance</span>
          <span className="trade-info-value">{slippage}%</span>
        </div>
        <div className="trade-info-row">
          <span className="trade-info-label underline decoration-dotted cursor-help">Simulated Spread</span>
          <span className="trade-info-value">{(spreadBps * 100).toFixed(4)}%</span>
        </div>
        <div className="trade-info-row">
          <span className="trade-info-label">Amount</span>
          <span className="trade-info-value">{estimatedSize.toFixed(6)} {symbol}</span>
        </div>
        <div className="trade-info-row">
          <span className="trade-info-label">Exposure</span>
          <span className="trade-info-value">${exposure.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="trade-info-row">
          <span className="trade-info-label">Collateral at Open</span>
          <span className="trade-info-value">{(collateralNum * (1 - openFee/100)).toFixed(2)} USDC</span>
        </div>
        <div className="trade-info-row">
          <span className="trade-info-label">Liquidation Price</span>
          <span className="trade-info-value text-warning">{liquidationPrice.toFixed(2)}</span>
        </div>
        
        <div className="trade-info-divider" />
        
        <div className="trade-info-row">
          <span className="trade-info-label underline decoration-dotted cursor-help">Fees</span>
          <span />
        </div>
        <div className="trade-info-row ml-4">
          <span className="trade-info-label">Open</span>
          <span className="trade-info-value">{openFee}%</span>
        </div>
        <div className="trade-info-row ml-4">
          <span className="trade-info-label">Close</span>
          <span className="trade-info-value">{closeFee}%</span>
        </div>
      </div>

      {/* Submit Button */}
      {account ? (
        <Button
          className={`trade-submit-btn ${side}`}
          onClick={handleSubmit}
          disabled={collateralNum <= 0 || collateralNum > availableBalance}
        >
          {side === 'long' ? 'BUY' : 'SELL'} {symbol}
        </Button>
      ) : (
        <ConnectButton
          client={client}
          chain={etoMainnet}
          chains={supportedChains}
          wallets={wallets}
          connectButton={{
            label: "Connect Wallet",
            className: "trade-connect-btn",
          }}
        />
      )}
    </div>
  );
}

export default TradePanel;

