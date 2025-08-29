export interface AssetBalance {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  reservedAmount: number;
  availableBalance: number;
  usdValue: number;
  price: number;
}

export interface BalanceReservation {
  id: string;
  asset: string;
  amount: number;
  type: 'order' | 'transaction';
  timestamp: number;
  orderId?: string;
}

// Asset definitions with demo balances
const SUPPORTED_ASSETS = {
  USDC: { name: "USD Coin", decimals: 6, demoBalance: 10000, address: "0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606eb48" },
  ETH: { name: "Ethereum", decimals: 18, demoBalance: 5, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
  WETH: { name: "Wrapped Ethereum", decimals: 18, demoBalance: 0, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
  MAANG: { name: "Meta AI & Analytics", decimals: 18, demoBalance: 100, address: "0x" },
  AVAX: { name: "Avalanche", decimals: 18, demoBalance: 200, address: "0x" },
  BTC: { name: "Bitcoin", decimals: 8, demoBalance: 0.5, address: "0x" }
};

// Market prices for demo
const ASSET_PRICES = {
  USDC: 1.00,
  ETH: 3567.00,
  WETH: 3567.00,
  MAANG: 238.00,
  AVAX: 26.00,
  BTC: 45000.00
};

export class BalanceManager {
  private reservations: Map<string, BalanceReservation> = new Map();
  private balanceCache: Map<string, AssetBalance> = new Map();

  constructor() {
    this.initializeBalances();
  }

  private initializeBalances() {
    Object.entries(SUPPORTED_ASSETS).forEach(([symbol, asset]) => {
      const price = ASSET_PRICES[symbol as keyof typeof ASSET_PRICES];
      const balance: AssetBalance = {
        symbol,
        name: asset.name,
        balance: asset.demoBalance,
        decimals: asset.decimals,
        reservedAmount: 0,
        availableBalance: asset.demoBalance,
        usdValue: asset.demoBalance * price,
        price
      };
      this.balanceCache.set(symbol, balance);
    });
  }

  getAllBalances(): AssetBalance[] {
    return Array.from(this.balanceCache.values()).map(balance => ({
      ...balance,
      availableBalance: balance.balance - balance.reservedAmount,
      usdValue: balance.balance * balance.price
    }));
  }

  getBalance(asset: string): AssetBalance | null {
    const balance = this.balanceCache.get(asset);
    if (!balance) return null;

    return {
      ...balance,
      availableBalance: balance.balance - balance.reservedAmount,
      usdValue: balance.balance * balance.price
    };
  }

  getAvailableBalance(asset: string): number {
    const balance = this.getBalance(asset);
    return balance ? balance.availableBalance : 0;
  }

  getTotalPortfolioValue(): number {
    return this.getAllBalances().reduce((total, balance) => total + balance.usdValue, 0);
  }

  // Balance reservation system
  reserveBalance(asset: string, amount: number, type: 'order' | 'transaction', orderId?: string): string {
    const balance = this.balanceCache.get(asset);
    if (!balance) {
      throw new Error(`Asset ${asset} not found`);
    }

    if (balance.availableBalance < amount) {
      throw new Error(`Insufficient balance. Available: ${balance.availableBalance}, Required: ${amount}`);
    }

    const reservationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reservation: BalanceReservation = {
      id: reservationId,
      asset,
      amount,
      type,
      timestamp: Date.now(),
      orderId
    };

    this.reservations.set(reservationId, reservation);
    
    // Update reserved amount
    balance.reservedAmount += amount;
    balance.availableBalance = balance.balance - balance.reservedAmount;
    
    this.balanceCache.set(asset, balance);
    
    return reservationId;
  }

  releaseReservation(reservationId: string): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return false;

    const balance = this.balanceCache.get(reservation.asset);
    if (balance) {
      balance.reservedAmount = Math.max(0, balance.reservedAmount - reservation.amount);
      balance.availableBalance = balance.balance - balance.reservedAmount;
      this.balanceCache.set(reservation.asset, balance);
    }

    this.reservations.delete(reservationId);
    return true;
  }

  // Update balance after trade execution
  updateBalance(asset: string, change: number): void {
    const balance = this.balanceCache.get(asset);
    if (!balance) return;

    balance.balance = Math.max(0, balance.balance + change);
    balance.availableBalance = balance.balance - balance.reservedAmount;
    balance.usdValue = balance.balance * balance.price;
    
    this.balanceCache.set(asset, balance);
  }

  // Validation helpers
  validateAmount(asset: string, amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    const balance = this.getBalance(asset);
    if (!balance) {
      return { isValid: false, error: `Asset ${asset} not supported` };
    }

    if (amount > balance.availableBalance) {
      return { 
        isValid: false, 
        error: `Insufficient balance. Available: ${balance.availableBalance.toFixed(4)} ${asset}` 
      };
    }

    return { isValid: true };
  }

  // Precision helpers
  formatAmount(amount: number, asset: string): string {
    const balance = this.getBalance(asset);
    const decimals = balance?.decimals || 18;
    const displayDecimals = decimals > 6 ? 6 : decimals;
    return amount.toFixed(displayDecimals);
  }

  parseAmount(amountStr: string): number {
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) throw new Error("Invalid amount format");
    return amount;
  }
}

// Singleton instance
export const balanceManager = new BalanceManager();