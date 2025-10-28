
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
    totalStaked: "$458,234.50",
    description: "Balanced pair with MAANG growth potential",
    autoCompound: true,
    rewards: "$31.12/day"
  },
  {
    id: "eto-usdc",
    name: "ETO/USDC",
    apy: "18.5%",
    risk: "Low" as const,
    lockPeriod: "30 days",
    minStake: "$500",
    totalStaked: "$892,145.80",
    description: "Platform token staking with stability",
    autoCompound: true,
    rewards: "$45.23/day"
  },
  {
    id: "maang-solo",
    name: "MAANG Solo",
    apy: "15.2%",
    risk: "High" as const,
    lockPeriod: "180 days",
    minStake: "$2,000",
    totalStaked: "$234,567.20",
    description: "Pure MAANG exposure for maximum growth",
    autoCompound: false,
    rewards: "$9.76/day"
  },
  {
    id: "usdc-solo",
    name: "USDC Solo",
    apy: "8.7%",
    risk: "Low" as const,
    lockPeriod: "7 days",
    minStake: "$100",
    totalStaked: "$1,245,890.00",
    description: "Stable yield with USD backing",
    autoCompound: true,
    rewards: "$29.67/day"
  }
];

const USER_POSITIONS: any[] = [];

export default function Staking() {
  const [selectedStakingPool, setSelectedStakingPool] = useState<any>(STAKING_POOLS[0]);
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

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
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedPool={selectedStakingPool}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded((v: boolean) => !v)}
          isIsolated={true}
          onStakeNow={() => {
            /* no-op for now; widget handles confirmation and share */
          }}
        />
      </div>
    </div>
  );
}
