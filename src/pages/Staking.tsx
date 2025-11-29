
import { useState, useEffect } from "react";
import { StakingWidget } from "@/components/StakingWidget";

// NOTE: Staking pools data is placeholder - real data should come from on-chain contracts
const STAKING_POOLS = [
  {
    id: "maang-usdc",
    name: "MAANG/USDC",
    apy: "—%",
    risk: "Medium" as const,
    lockPeriod: "—",
    minStake: "$0",
    totalStaked: "$0",
    description: "Balanced pair with MAANG growth potential",
    autoCompound: true,
    rewards: "$0/day"
  },
  {
    id: "eto-usdc",
    name: "ETO/USDC",
    apy: "—%",
    risk: "Low" as const,
    lockPeriod: "—",
    minStake: "$0",
    totalStaked: "$0",
    description: "Platform token staking with stability",
    autoCompound: true,
    rewards: "$0/day"
  },
  {
    id: "maang-solo",
    name: "MAANG Solo",
    apy: "—%",
    risk: "High" as const,
    lockPeriod: "—",
    minStake: "$0",
    totalStaked: "$0",
    description: "Pure MAANG exposure for maximum growth",
    autoCompound: false,
    rewards: "$0/day"
  },
  {
    id: "usdc-solo",
    name: "USDC Solo",
    apy: "—%",
    risk: "Low" as const,
    lockPeriod: "—",
    minStake: "$0",
    totalStaked: "$0",
    description: "Stable yield with USD backing",
    autoCompound: true,
    rewards: "$0/day"
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
