import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { toast } from 'sonner';

// Asset types available for staking
export interface StakingAsset {
  id: string;
  name: string;
  symbol: string;
  type: 'pos' | 'defi' | 'liquid';
  logo: string;
  color: string;
  baseAPY: number;
  minStake: number;
  maxStake: number;
  lockPeriods: number[]; // Available lock periods in months
  riskLevel: 'low' | 'medium' | 'high';
  tvl: number;
  stakedByUser: number;
}

// Active staking position
export interface StakingPosition {
  id: string;
  assetId: string;
  amount: number;
  startDate: Date;
  lockPeriod: number; // months
  apy: number;
  earnedRewards: number;
  status: 'active' | 'unlocking' | 'completed';
  autoCompound: boolean;
}

// Investment calculation result
export interface StakingProjection {
  principal: number;
  totalRewards: number;
  effectiveAPY: number;
  monthlyRewards: number;
  endValue: number;
  riskScore: number;
}

interface StakingContextType {
  // Assets
  assets: StakingAsset[];
  selectedAsset: StakingAsset | null;
  selectAsset: (assetId: string) => void;
  
  // Investment settings
  investmentPeriod: number;
  setInvestmentPeriod: (months: number) => void;
  stakeAmount: number;
  setStakeAmount: (amount: number) => void;
  autoCompound: boolean;
  setAutoCompound: (enabled: boolean) => void;
  
  // Calculations
  calculateProjection: (amount: number, months: number, assetId?: string) => StakingProjection;
  getEffectiveAPY: (baseAPY: number, months: number, autoCompound: boolean) => number;
  
  // Positions
  positions: StakingPosition[];
  addPosition: (assetId: string, amount: number, lockPeriod: number) => void;
  removePosition: (positionId: string) => void;
  getTotalStaked: () => number;
  getTotalRewards: () => number;
  
  // UI State
  timeFilter: '24H' | '7D' | '30D';
  setTimeFilter: (filter: '24H' | '7D' | '30D') => void;
  sortOrder: 'apy' | 'tvl' | 'risk';
  setSortOrder: (order: 'apy' | 'tvl' | 'risk') => void;
  
  // Risk Analysis
  getRiskScore: (assetId: string, amount: number, period: number) => number;
  getRecommendedAllocation: (totalAmount: number) => { assetId: string; amount: number; percentage: number }[];
}

const StakingContext = createContext<StakingContextType | undefined>(undefined);

// Default staking assets - ETO L1 Native Assets Only
// NOTE: APY and TVL values are placeholders (zeroed) - real values should come from on-chain data
const defaultAssets: StakingAsset[] = [
  {
    id: 'maang',
    name: 'MAANG',
    symbol: 'MAANG',
    type: 'defi',
    logo: '/assets/maang-logo.svg',
    color: '#4dd4ac',
    baseAPY: 0, // No real APY data source yet
    minStake: 1,
    maxStake: 100000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'low',
    tvl: 0, // No real TVL data source yet
    stakedByUser: 0,
  },
  {
    id: 'smaang',
    name: 'Staked MAANG',
    symbol: 'sMAANG',
    type: 'liquid',
    logo: '/assets/maang-logo.svg',
    color: '#38bdf8',
    baseAPY: 0, // No real APY data source yet
    minStake: 1,
    maxStake: 100000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'low',
    tvl: 0, // No real TVL data source yet
    stakedByUser: 0,
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    type: 'defi',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040',
    color: '#2775ca',
    baseAPY: 0, // No real APY data source yet
    minStake: 10,
    maxStake: 1000000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'low',
    tvl: 0, // No real TVL data source yet
    stakedByUser: 0,
  },
];

// Demo positions - Empty by default, real positions come from on-chain data
// NOTE: This is placeholder data - real positions should be fetched from the vault contract
const demoPositions: StakingPosition[] = [];

export function StakingProvider({ children }: { children: ReactNode }) {
  // State
  const [assets] = useState<StakingAsset[]>(defaultAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('maang');
  const [investmentPeriod, setInvestmentPeriod] = useState(6);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [autoCompound, setAutoCompound] = useState(true);
  const [positions, setPositions] = useState<StakingPosition[]>(demoPositions);
  const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '30D'>('24H');
  const [sortOrder, setSortOrder] = useState<'apy' | 'tvl' | 'risk'>('apy');

  // Derived state
  const selectedAsset = useMemo(() => 
    assets.find(a => a.id === selectedAssetId) || null,
    [assets, selectedAssetId]
  );

  // Calculate effective APY with bonuses
  const getEffectiveAPY = useCallback((baseAPY: number, months: number, compound: boolean): number => {
    let apy = baseAPY;
    
    // Lock period bonus
    if (months >= 12) apy += 2.5;
    else if (months >= 6) apy += 1.5;
    else if (months >= 3) apy += 0.8;
    
    // Auto-compound bonus
    if (compound) {
      // Compound monthly
      const monthlyRate = apy / 100 / 12;
      const compoundedRate = Math.pow(1 + monthlyRate, 12) - 1;
      apy = compoundedRate * 100;
    }
    
    return Math.round(apy * 100) / 100;
  }, []);

  // Calculate risk score (0-100)
  const getRiskScore = useCallback((assetId: string, amount: number, period: number): number => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return 50;
    
    let score = 50; // Base score
    
    // Asset risk level
    if (asset.riskLevel === 'low') score -= 20;
    else if (asset.riskLevel === 'high') score += 20;
    
    // Amount concentration (higher % of TVL = higher risk)
    const concentration = (amount / (asset.tvl / 1000000)) * 100;
    score += Math.min(concentration * 2, 15);
    
    // Lock period (longer = lower short-term risk but higher opportunity cost)
    if (period >= 12) score -= 10;
    else if (period <= 1) score += 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [assets]);

  // Calculate staking projection
  const calculateProjection = useCallback((amount: number, months: number, assetId?: string): StakingProjection => {
    const asset = assetId ? assets.find(a => a.id === assetId) : selectedAsset;
    if (!asset) {
      return {
        principal: amount,
        totalRewards: 0,
        effectiveAPY: 0,
        monthlyRewards: 0,
        endValue: amount,
        riskScore: 50,
      };
    }

    const effectiveAPY = getEffectiveAPY(asset.baseAPY, months, autoCompound);
    const yearlyRewards = amount * (effectiveAPY / 100);
    const totalRewards = (yearlyRewards / 12) * months;
    const monthlyRewards = yearlyRewards / 12;
    const riskScore = getRiskScore(asset.id, amount, months);

    return {
      principal: amount,
      totalRewards: Math.round(totalRewards * 1000000) / 1000000,
      effectiveAPY,
      monthlyRewards: Math.round(monthlyRewards * 1000000) / 1000000,
      endValue: Math.round((amount + totalRewards) * 1000000) / 1000000,
      riskScore,
    };
  }, [assets, selectedAsset, autoCompound, getEffectiveAPY, getRiskScore]);

  // Select asset
  const selectAsset = useCallback((assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setSelectedAssetId(assetId);
      toast.success(`Selected ${asset.name} for staking`);
    }
  }, [assets]);

  // Add position
  const addPosition = useCallback((assetId: string, amount: number, lockPeriod: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      toast.error('Invalid asset selected');
      return;
    }

    if (amount < asset.minStake) {
      toast.error(`Minimum stake is ${asset.minStake} ${asset.symbol}`);
      return;
    }

    if (amount > asset.maxStake) {
      toast.error(`Maximum stake is ${asset.maxStake} ${asset.symbol}`);
      return;
    }

    const effectiveAPY = getEffectiveAPY(asset.baseAPY, lockPeriod, autoCompound);

    const newPosition: StakingPosition = {
      id: `pos-${Date.now()}`,
      assetId,
      amount,
      startDate: new Date(),
      lockPeriod,
      apy: effectiveAPY,
      earnedRewards: 0,
      status: 'active',
      autoCompound,
    };

    setPositions(prev => [...prev, newPosition]);
    toast.success(`Staked ${amount} ${asset.symbol} for ${lockPeriod} months at ${effectiveAPY}% APY`);
  }, [assets, autoCompound, getEffectiveAPY]);

  // Remove position
  const removePosition = useCallback((positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const asset = assets.find(a => a.id === position.assetId);
    
    setPositions(prev => prev.filter(p => p.id !== positionId));
    toast.success(`Unstaked ${position.amount} ${asset?.symbol || 'tokens'}`);
  }, [positions, assets]);

  // Get totals
  const getTotalStaked = useCallback(() => {
    return positions.reduce((sum, p) => sum + p.amount, 0);
  }, [positions]);

  const getTotalRewards = useCallback(() => {
    return positions.reduce((sum, p) => sum + p.earnedRewards, 0);
  }, [positions]);

  // Get recommended allocation
  const getRecommendedAllocation = useCallback((totalAmount: number) => {
    // Simple diversification strategy for ETO L1 native assets
    const allocations = [
      { assetId: 'maang', percentage: 50 },
      { assetId: 'smaang', percentage: 30 },
      { assetId: 'usdc', percentage: 20 },
    ];

    return allocations.map(a => ({
      ...a,
      amount: (totalAmount * a.percentage) / 100,
    }));
  }, []);

  const value: StakingContextType = {
    assets,
    selectedAsset,
    selectAsset,
    investmentPeriod,
    setInvestmentPeriod,
    stakeAmount,
    setStakeAmount,
    autoCompound,
    setAutoCompound,
    calculateProjection,
    getEffectiveAPY,
    positions,
    addPosition,
    removePosition,
    getTotalStaked,
    getTotalRewards,
    timeFilter,
    setTimeFilter,
    sortOrder,
    setSortOrder,
    getRiskScore,
    getRecommendedAllocation,
  };

  return (
    <StakingContext.Provider value={value}>
      {children}
    </StakingContext.Provider>
  );
}

export function useStakingContext() {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStakingContext must be used within StakingProvider');
  }
  return context;
}

