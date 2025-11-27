import { useQuery } from '@tanstack/react-query';
import { etoPublicClient } from '@/lib/etoRpc';
import { DMM_ADDRESS, SMAANG_VAULT_ADDRESS, BOOTSTRAP_DRI_CONTROLLER_ADDRESS } from '@/config/contracts';
import { formatDistanceToNow } from 'date-fns';

// Event signatures for filtering
const EVENT_SIGNATURES = {
  // DMM events
  Swap: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  LiquidityAdded: '0x06239653922ac7bea6aa2b19dc486b9361821d37712eb796adfd38d81de278ca',
  LiquidityRemoved: '0x992f1b920d1f9e27e4c7a7c2d5dc7ebfbc24bc2a4e52ad7bab18a0f5a7b3ca64',
  BandShifted: '0x4f9e3b5c2a2d8e6b1c9d8f7a6e5d4c3b2a1908070605040302010009080706050403',
  
  // Vault events  
  DripCommitted: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  DripExecuted: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  
  // Controller events
  PriceSynced: '0x8765432109876543210987654321098765432109876543210987654321098765',
};

export interface ProtocolActivity {
  id: string;
  type: 'swap' | 'drip_commit' | 'drip_execute' | 'deposit' | 'withdraw' | 'sync' | 'recenter';
  description: string;
  amount?: string;
  value?: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  timeAgo: string;
}

// Minimal ABIs for reading events
const VAULT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'keeper', type: 'address' },
      { indexed: false, name: 'commitment', type: 'bytes32' },
      { indexed: false, name: 'stagedMAANG', type: 'uint256' },
      { indexed: false, name: 'stagedUSDC', type: 'uint256' },
    ],
    name: 'DripCommitted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'keeper', type: 'address' },
      { indexed: false, name: 'dmmMAANG', type: 'uint256' },
      { indexed: false, name: 'dmmUSDC', type: 'uint256' },
      { indexed: false, name: 'psmMAANG', type: 'uint256' },
      { indexed: false, name: 'psmUSDC', type: 'uint256' },
    ],
    name: 'DripExecuted',
    type: 'event'
  },
  {
    inputs: [],
    name: 'lastDripBlock',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'stagedMAANG',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'stagedUSDC',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export function useProtocolActivity() {
  return useQuery({
    queryKey: ['protocol-activity'],
    queryFn: async (): Promise<ProtocolActivity[]> => {
      try {
        const activities: ProtocolActivity[] = [];
        
        // Get current block
        const currentBlock = await etoPublicClient.getBlockNumber();
        const fromBlock = currentBlock - 1000n; // Last ~1000 blocks
        
        // Fetch vault drip state
        const [lastDripBlock, stagedMAANG, stagedUSDC] = await Promise.all([
          etoPublicClient.readContract({
            address: SMAANG_VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'lastDripBlock',
          }).catch(() => 0n),
          etoPublicClient.readContract({
            address: SMAANG_VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'stagedMAANG',
          }).catch(() => 0n),
          etoPublicClient.readContract({
            address: SMAANG_VAULT_ADDRESS as `0x${string}`,
            abi: VAULT_ABI,
            functionName: 'stagedUSDC',
          }).catch(() => 0n),
        ]);

        // Add drip status activity
        if (lastDripBlock > 0n) {
          const blocksSinceLastDrip = currentBlock - lastDripBlock;
          activities.push({
            id: `drip-status-${lastDripBlock}`,
            type: 'drip_execute',
            description: `Last drip at block ${lastDripBlock}`,
            amount: `${blocksSinceLastDrip} blocks ago`,
            txHash: '',
            blockNumber: Number(lastDripBlock),
            timestamp: Date.now() - Number(blocksSinceLastDrip) * 2000, // ~2s per block
            timeAgo: `${blocksSinceLastDrip} blocks ago`,
          });
        }

        // Add staged funds info
        if (stagedMAANG > 0n || stagedUSDC > 0n) {
          const stagedMAANGNum = Number(stagedMAANG) / 1e18;
          const stagedUSDCNum = Number(stagedUSDC) / 1e6;
          activities.push({
            id: 'staged-funds',
            type: 'drip_commit',
            description: 'Funds staged for next drip',
            amount: `${stagedMAANGNum.toFixed(4)} DRI + ${stagedUSDCNum.toFixed(2)} USDC`,
            txHash: '',
            blockNumber: Number(currentBlock),
            timestamp: Date.now(),
            timeAgo: 'Pending',
          });
        }

        // Fetch recent logs from vault
        try {
          const logs = await etoPublicClient.getLogs({
            address: SMAANG_VAULT_ADDRESS as `0x${string}`,
            fromBlock,
            toBlock: currentBlock,
          });

          // Parse logs and add to activities
          for (const log of logs.slice(-20)) { // Last 20 events
            const block = await etoPublicClient.getBlock({ blockNumber: log.blockNumber });
            const timestamp = Number(block.timestamp) * 1000;
            
            // Identify event type by topic
            const topic0 = log.topics[0];
            let type: ProtocolActivity['type'] = 'deposit';
            let description = 'Vault event';

            // Try to identify the event
            if (log.data && log.data.length > 2) {
              const dataValue = BigInt(log.data.slice(0, 66));
              const valueStr = (Number(dataValue) / 1e18).toFixed(4);
              
              // Heuristic: check if it's a drip or deposit based on data size
              if (log.data.length > 200) {
                type = 'drip_execute';
                description = `Drip executed`;
              } else if (log.data.length > 130) {
                type = 'drip_commit';
                description = `Drip committed`;
              } else {
                description = `Vault activity (${valueStr})`;
              }
            }

            activities.push({
              id: log.transactionHash + '-' + log.logIndex,
              type,
              description,
              txHash: log.transactionHash,
              blockNumber: Number(log.blockNumber),
              timestamp,
              timeAgo: formatDistanceToNow(timestamp, { addSuffix: true }),
            });
          }
        } catch (e) {
          console.warn('Failed to fetch vault logs:', e);
        }

        // Sort by block number (most recent first)
        activities.sort((a, b) => b.blockNumber - a.blockNumber);

        return activities.slice(0, 10); // Return top 10
      } catch (error) {
        console.error('Failed to fetch protocol activity:', error);
        return [];
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
}

// Hook for user's vault position
export function useUserVaultPosition(userAddress?: string) {
  return useQuery({
    queryKey: ['user-vault-position', userAddress],
    queryFn: async () => {
      if (!userAddress) return null;

      const VAULT_BALANCE_ABI = [
        {
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'totalSupply',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
        {
          inputs: [],
          name: 'totalAssets',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        },
      ] as const;

      const [userShares, totalSupply, totalAssets] = await Promise.all([
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_BALANCE_ABI,
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`],
        }),
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_BALANCE_ABI,
          functionName: 'totalSupply',
        }),
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_BALANCE_ABI,
          functionName: 'totalAssets',
        }),
      ]);

      const sharePrice = totalSupply > 0n ? Number(totalAssets) / Number(totalSupply) : 1;
      const userValue = Number(userShares) * sharePrice / 1e18;
      const ownershipPercent = totalSupply > 0n 
        ? (Number(userShares) / Number(totalSupply)) * 100 
        : 0;

      return {
        shares: Number(userShares) / 1e18,
        value: userValue,
        sharePrice,
        ownershipPercent,
      };
    },
    enabled: !!userAddress,
    refetchInterval: 15000,
  });
}

