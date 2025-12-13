import { useProtocolStore, selectActivities, selectIsRefreshing, selectStats, selectLatestBlock } from '@/stores/protocolStore';
import { refreshData, getDataLayer } from '@/lib/dataLayer';
import { useQuery } from '@tanstack/react-query';
import { SMAANG_VAULT_ADDRESS } from '@/config/contracts';
import { getAllProtocolActivity, type ProtocolActivityItem } from '@/lib/graphql';

// =============================================================================
// Protocol Activity Hook - All Events from Subgraph with Address Exclusion
// =============================================================================

export interface ProtocolActivity {
  id: string;
  type: 'swap' | 'drip_commit' | 'drip_execute' | 'deposit' | 'withdraw' | 'sync' | 'recenter' | 'liquidity_add' | 'liquidity_remove';
  description: string;
  amount?: string;
  value?: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  timeAgo: string;
  user?: string;
}

function transformSubgraphActivity(item: ProtocolActivityItem): ProtocolActivity {
  // Map subgraph types to our types
  const typeMap: Record<string, ProtocolActivity['type']> = {
    'swap': 'swap',
    'deposit': 'deposit',
    'withdrawal': 'withdraw',
    'liquidity_add': 'liquidity_add',
    'liquidity_remove': 'liquidity_remove',
  };

  return {
    id: item.id,
    type: typeMap[item.type] || 'swap',
    description: item.description,
    amount: item.amount,
    value: item.value,
    txHash: item.txHash,
    blockNumber: item.blockNumber,
    timestamp: item.timestamp,
    timeAgo: item.timeAgo,
    user: item.user,
  };
}

export function useProtocolActivity() {
  // Real-time activities from Zustand store (WebSocket) for immediate updates
  const realtimeActivities = useProtocolStore(selectActivities);
  const isRefreshing = useProtocolStore(selectIsRefreshing);

  // All protocol activity from subgraph (excludes 0xA891D95248d4527FBEC8991080D99466001A51ce)
  const { data: subgraphData, isLoading: isLoadingSubgraph, refetch: refetchSubgraph } = useQuery({
    queryKey: ['all-protocol-activity'],
    queryFn: async () => {
      try {
        const activities = await getAllProtocolActivity(50);
        return activities.map(transformSubgraphActivity);
      } catch (error) {
        console.warn('Subgraph activity query failed:', error);
        return [];
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Merge real-time + subgraph, preferring real-time for recent events
  const mergedActivities = (() => {
    const subgraph = subgraphData || [];
    const realtime = realtimeActivities || [];
    
    // Create map of existing IDs to avoid duplicates
    const seen = new Set(realtime.map(a => a.id));
    
    // Add subgraph events not in real-time
    const combined = [
      ...realtime,
      ...subgraph.filter(h => !seen.has(h.id)),
    ];
    
    // Sort by timestamp descending
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  })();

  return {
    data: mergedActivities,
    isLoading: isRefreshing && isLoadingSubgraph,
    refetch: async () => {
      await refreshData();
      await refetchSubgraph();
      await getDataLayer().refreshActivity();
    },
  };
}

// =============================================================================
// User Vault Position Hook
// =============================================================================

export function useUserVaultPosition(userAddress?: string) {
  const stats = useProtocolStore(selectStats);
  
  return useQuery({
    queryKey: ['user-vault-position', userAddress],
    queryFn: async () => {
      if (!userAddress) return null;

      const httpClient = getDataLayer().getHttpClient();

      const VAULT_BALANCE_ABI = [
        {
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
      ] as const;

      try {
        const userShares = await httpClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`],
        });

        const sharePrice = stats.vaultSharePrice || 1;
        const totalSupply = stats.vaultTotalSupply || 1;
        const userValue = Number(userShares) * sharePrice / 1e18;
        const ownershipPercent = totalSupply > 0 
          ? (Number(userShares) / (totalSupply * 1e18)) * 100 
          : 0;

        return {
          shares: Number(userShares) / 1e18,
          value: userValue,
          sharePrice,
          ownershipPercent,
        };
      } catch (error) {
        console.error('Failed to fetch user vault position:', error);
        return null;
      }
    },
    enabled: !!userAddress,
    refetchInterval: 15000, // Still poll for user-specific data
  });
}
