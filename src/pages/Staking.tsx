
import { useState, useEffect } from "react";
import { StakingWidget } from "@/components/StakingWidget";

const STAKING_POOLS = [
  {
    id: "maang-usdc",
    name: "MAANG/USDC",
    apy: "24.8%",
    risk: "Medium" as const,
    lockPeriod: "90 days",
    minStake: "$1,000",
    totalStaked: "$0.00",
    description: "Balanced pair with MAANG growth potential",
    autoCompound: true,
    rewards: "$0.00/day"
  },
  {
    id: "eto-usdc",
    name: "ETO/USDC",
    apy: "18.5%",
    risk: "Low" as const,
    lockPeriod: "30 days",
    minStake: "$500",
    totalStaked: "$0.00",
    description: "Platform token staking with stability",
    autoCompound: true,
    rewards: "$0.00/day"
  },
  {
    id: "maang-solo",
    name: "MAANG Solo",
    apy: "15.2%",
    risk: "High" as const,
    lockPeriod: "180 days",
    minStake: "$2,000",
    totalStaked: "$0.00",
    description: "Pure MAANG exposure for maximum growth",
    autoCompound: false,
    rewards: "$0.00/day"
  },
  {
    id: "usdc-solo",
    name: "USDC Solo",
    apy: "8.7%",
    risk: "Low" as const,
    lockPeriod: "7 days",
    minStake: "$100",
    totalStaked: "$0.00",
    description: "Stable yield with USD backing",
    autoCompound: true,
    rewards: "$0.00/day"
  }
];

const USER_POSITIONS: any[] = [];

export default function Staking() {
  const [selectedStakingPool, setSelectedStakingPool] = useState<any>(STAKING_POOLS[0]);

  // Handle URL parameters for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const poolId = urlParams.get('pool');

    if (poolId) {
      const pool = STAKING_POOLS.find(p => p.id === poolId);
      if (pool) {
        setSelectedStakingPool(pool);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <StakingWidget
          isOpen={true}
          onClose={() => {}}
          selectedPool={selectedStakingPool}
          isExpanded={true}
          onToggleExpanded={() => {}}
          isIsolated={true}
          onStakeNow={() => {}}
        />
      </div>
    </div>
  );
}
