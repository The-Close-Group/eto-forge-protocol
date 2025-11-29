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

// Default staking assets
const defaultAssets: StakingAsset[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'pos',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',
    color: '#627eea',
    baseAPY: 4.5,
    minStake: 0.01,
    maxStake: 1000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'low',
    tvl: 45000000,
    stakedByUser: 0,
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    symbol: 'BNB',
    type: 'pos',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040',
    color: '#f3ba2f',
    baseAPY: 5.2,
    minStake: 0.1,
    maxStake: 500,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'low',
    tvl: 32000000,
    stakedByUser: 0,
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    type: 'pos',
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg?v=040',
    color: '#8247e5',
    baseAPY: 6.8,
    minStake: 10,
    maxStake: 100000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'medium',
    tvl: 18000000,
    stakedByUser: 0,
  },
  {
    id: 'avax',
    name: 'Avalanche',
    symbol: 'AVAX',
    type: 'pos',
    logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=040',
    color: '#e84142',
    baseAPY: 8.2,
    minStake: 1,
    maxStake: 10000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'medium',
    tvl: 25000000,
    stakedByUser: 0,
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    type: 'pos',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=040',
    color: '#14f195',
    baseAPY: 7.5,
    minStake: 0.5,
    maxStake: 5000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'medium',
    tvl: 28000000,
    stakedByUser: 0,
  },
  {
    id: 'atom',
    name: 'Cosmos',
    symbol: 'ATOM',
    type: 'pos',
    logo: 'https://cryptologos.cc/logos/cosmos-atom-logo.svg?v=040',
    color: '#2e3148',
    baseAPY: 12.5,
    minStake: 1,
    maxStake: 50000,
    lockPeriods: [1, 3, 6, 12],
    riskLevel: 'high',
    tvl: 12000000,
    stakedByUser: 0,
  },
];

// Demo positions
const demoPositions: StakingPosition[] = [
  {
    id: 'pos-1',
    assetId: 'avax',
    amount: 125.5,
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    lockPeriod: 6,
    apy: 9.8,
    earnedRewards: 31.39686,
    status: 'active',
    autoCompound: true,
  },
  {
    id: 'pos-2',
    assetId: 'eth',
    amount: 2.5,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lockPeriod: 3,
    apy: 5.2,
    earnedRewards: 0.0108,
    status: 'active',
    autoCompound: false,
  },
];

export function StakingProvider({ children }: { children: ReactNode }) {
  // State
  const [assets] = useState<StakingAsset[]>(defaultAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('avax');
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
    // Simple diversification strategy
    const allocations = [
      { assetId: 'eth', percentage: 40 },
      { assetId: 'bnb', percentage: 25 },
      { assetId: 'avax', percentage: 20 },
      { assetId: 'matic', percentage: 15 },
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

