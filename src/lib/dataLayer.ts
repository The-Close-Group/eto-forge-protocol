import { createPublicClient, http, webSocket } from 'viem';
import { defineChain } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import { useProtocolStore, type TokenBalance, type ProtocolActivity } from '@/stores/protocolStore';
import { CONTRACTS, ORACLE_ABI, DMM_ABI, ERC20_ABI } from '@/config/contracts';
import { CHAIN_CONFIGS } from '@/config/tokens';

// =============================================================================
// ETO L1 Chain Definition
// =============================================================================

export const etoL1Chain = defineChain({
  id: 69670,
  name: 'ETO L1 Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://eto.ash.center/rpc'], webSocket: ['wss://eto.ash.center/ws'] },
    public: { http: ['https://eto.ash.center/rpc'], webSocket: ['wss://eto.ash.center/ws'] },
  },
  blockExplorers: {
    default: { name: 'ETO Explorer', url: 'https://eto-explorer.ash.center' },
  },
});

// =============================================================================
// Contract ABIs for Multicall
// =============================================================================

const VAULT_ABI = [
  { inputs: [], name: 'totalAssets', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'lastDripBlock', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'stagedMAANG', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'stagedUSDC', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const;

const FULL_DMM_ABI = [
  { inputs: [], name: 'getCurrentPrice', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'totalLiquidity', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'liquidityPosition', outputs: [
    { name: 'driTokens', type: 'uint256' },
    { name: 'usdcTokens', type: 'uint256' },
    { name: 'lowerTick', type: 'uint256' },
    { name: 'upperTick', type: 'uint256' },
    { name: 'liquidity', type: 'uint256' }
  ], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'paused', outputs: [{ name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
] as const;

// =============================================================================
// Data Layer Class - Manages WebSocket + Multicall
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ViemClient = any;

class DataLayer {
  private httpClient: ViemClient;
  private wsClient: ViemClient | null = null;
  private unsubscribeBlocks: (() => void) | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  private currentUserAddress: string | null = null;

  constructor() {
    // HTTP client for multicall reads
    this.httpClient = createPublicClient({
      chain: etoL1Chain,
      transport: http('https://eto.ash.center/rpc'),
    });
  }

  // ==========================================================================
  // WebSocket Connection Management
  // ==========================================================================

  async connect(): Promise<void> {
    if (this.isDestroyed) return;

    const store = useProtocolStore.getState();
    
    try {
      // Test HTTP connection first
      await this.httpClient.getBlockNumber();
      store.setConnection({ rpcConnected: true });

      // Create WebSocket client
      this.wsClient = createPublicClient({
        chain: etoL1Chain,
        transport: webSocket('wss://eto.ash.center/ws'),
      });

      // Subscribe to new blocks - but THROTTLE data refresh to every 10 seconds
      let lastRefreshBlock = 0n;
      const REFRESH_INTERVAL_BLOCKS = 5n; // Only refresh every 5 blocks (~10 seconds)
      
      this.unsubscribeBlocks = this.wsClient.watchBlockNumber({
        onBlockNumber: async (blockNumber) => {
          // Update block number silently (no data refresh)
          try {
            const block = await this.httpClient.getBlock({ blockNumber });
            store.setLatestBlock({
              number: blockNumber,
              timestamp: Number(block.timestamp) * 1000,
              hash: block.hash,
            });
          } catch (e) {
            // Silently fail - block info is not critical
          }

          // Only refresh data every N blocks to avoid UI dancing
          if (lastRefreshBlock === 0n || blockNumber - lastRefreshBlock >= REFRESH_INTERVAL_BLOCKS) {
            lastRefreshBlock = blockNumber;
            console.log(`[DataLayer] Refreshing data at block ${blockNumber}`);
            await this.refreshAllData();
          }
        },
        onError: (error) => {
          console.error('[DataLayer] Block subscription error:', error);
          store.setConnection({ wsConnected: false, lastError: error.message });
          this.scheduleReconnect();
        },
      });

      store.setConnection({ wsConnected: true, lastError: null, reconnectAttempts: 0 });
      console.log('[DataLayer] WebSocket connected successfully');

      // Initial data fetch
      await this.refreshAllData();
      store.setInitializing(false);

    } catch (error: any) {
      console.error('[DataLayer] Connection failed:', error);
      store.setConnection({ 
        wsConnected: false, 
        lastError: error.message,
        reconnectAttempts: store.connection.reconnectAttempts + 1 
      });
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.isDestroyed) return;

    const store = useProtocolStore.getState();
    const delay = Math.min(1000 * Math.pow(2, store.connection.reconnectAttempts), 30000);
    
    console.log(`[DataLayer] Scheduling reconnect in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  disconnect(): void {
    this.isDestroyed = true;
    
    if (this.unsubscribeBlocks) {
      this.unsubscribeBlocks();
      this.unsubscribeBlocks = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.wsClient = null;
    useProtocolStore.getState().setConnection({ wsConnected: false, rpcConnected: false });
  }

  // ==========================================================================
  // Contract Reads - Individual calls (ETO L1 doesn't have multicall3)
  // ==========================================================================

  async refreshAllData(): Promise<void> {
    const store = useProtocolStore.getState();
    store.setRefreshing(true);

    try {
      // Parallel individual contract reads (no multicall3 on ETO L1)
      const [
        oracleResult,
        dmmPriceResult,
        totalLiquidityResult,
        liquidityPositionResult,
        dmmPausedResult,
        vaultAssetsResult,
        vaultSupplyResult,
      ] = await Promise.all([
        // Oracle price
        this.httpClient.readContract({
          address: CONTRACTS.ORACLE_AGGREGATOR as `0x${string}`,
          abi: ORACLE_ABI,
          functionName: 'getAggregatedPrice',
        }).catch(() => null),
        
        // DMM price
        this.httpClient.readContract({
          address: CONTRACTS.DYNAMIC_MARKET_MAKER as `0x${string}`,
          abi: FULL_DMM_ABI,
          functionName: 'getCurrentPrice',
        }).catch(() => null),
        
        // DMM liquidity
        this.httpClient.readContract({
          address: CONTRACTS.DYNAMIC_MARKET_MAKER as `0x${string}`,
          abi: FULL_DMM_ABI,
          functionName: 'totalLiquidity',
        }).catch(() => null),
        
        // DMM liquidity position
        this.httpClient.readContract({
          address: CONTRACTS.DYNAMIC_MARKET_MAKER as `0x${string}`,
          abi: FULL_DMM_ABI,
          functionName: 'liquidityPosition',
        }).catch(() => null),
        
        // DMM paused
        this.httpClient.readContract({
          address: CONTRACTS.DYNAMIC_MARKET_MAKER as `0x${string}`,
          abi: FULL_DMM_ABI,
          functionName: 'paused',
        }).catch(() => null),
        
        // Vault total assets
        this.httpClient.readContract({
          address: CONTRACTS.SMAANG_VAULT as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'totalAssets',
        }).catch(() => null),
        
        // Vault total supply
        this.httpClient.readContract({
          address: CONTRACTS.SMAANG_VAULT as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'totalSupply',
        }).catch(() => null),
      ]);

      // Extract values with fallbacks
      const oraclePrice = oracleResult 
        ? Number((oracleResult as [bigint, bigint])[0]) / 1e18 
        : store.prices.oraclePrice;
      
      const oracleTimestamp = oracleResult
        ? Number((oracleResult as [bigint, bigint])[1])
        : store.prices.oracleTimestamp;
      
      const dmmPrice = dmmPriceResult
        ? Number(dmmPriceResult as bigint) / 1e18
        : store.prices.dmmPrice;
      
      const totalLiquidity = totalLiquidityResult
        ? Number(totalLiquidityResult as bigint) / 1e18
        : store.stats.totalLiquidity;
      
      const liquidityPosition = liquidityPositionResult
        ? liquidityPositionResult as [bigint, bigint, bigint, bigint, bigint]
        : [0n, 0n, 0n, 0n, 0n];
      
      const dmmPaused = dmmPausedResult !== null
        ? dmmPausedResult as boolean
        : store.stats.dmmPaused;
      
      const vaultTotalAssets = vaultAssetsResult
        ? Number(vaultAssetsResult as bigint) / 1e18
        : store.stats.vaultTotalAssets;
      
      const vaultTotalSupply = vaultSupplyResult
        ? Number(vaultSupplyResult as bigint) / 1e18
        : store.stats.vaultTotalSupply;

      // Calculate derived values
      const priceDeviation = oraclePrice > 0 
        ? ((dmmPrice - oraclePrice) / oraclePrice) * 10000 
        : 0;
      
      const vaultSharePrice = vaultTotalSupply > 0 
        ? vaultTotalAssets / vaultTotalSupply 
        : 1;
      
      const dmmDriBalance = Number(liquidityPosition[0]) / 1e18;
      const dmmUsdcBalance = Number(liquidityPosition[1]) / 1e6;
      
      // TVL = DMM USDC + DMM DRI value + Vault assets value
      // Vault holds USDC, so vaultTotalAssets is already in USD terms
      const dmmDriValue = dmmDriBalance * dmmPrice;
      const tvl = dmmUsdcBalance + dmmDriValue + vaultTotalAssets;
      
      const isHealthy = !dmmPaused && Math.abs(priceDeviation) < 100;

      // Single batch update to store
      store.updateFromMulticall({
        prices: {
          oraclePrice,
          oracleTimestamp,
          dmmPrice,
          priceDeviation,
        },
        stats: {
          totalLiquidity,
          dmmDriBalance,
          dmmUsdcBalance,
          dmmPaused,
          vaultTotalAssets,
          vaultTotalSupply,
          vaultSharePrice,
          tvl,
          isHealthy,
        },
      });

      // Refresh user balances if connected
      if (this.currentUserAddress) {
        await this.refreshUserBalances(this.currentUserAddress);
      }

    } catch (error) {
      console.error('[DataLayer] Contract reads failed:', error);
    } finally {
      store.setRefreshing(false);
    }
  }

  // ==========================================================================
  // User Balance Fetching
  // ==========================================================================

  setUserAddress(address: string | null): void {
    this.currentUserAddress = address;
    if (address) {
      this.refreshUserBalances(address);
    }
  }

  async refreshUserBalances(address: string): Promise<void> {
    if (!address) return;

    const store = useProtocolStore.getState();
    const chainConfig = CHAIN_CONFIGS['etoMainnet'];
    if (!chainConfig) return;

    try {
      const balancePromises: Promise<{ symbol: string; balance: bigint; decimals: number; isNative: boolean }>[] = [];

      // Native ETH balance
      balancePromises.push(
        this.httpClient.getBalance({ address: address as `0x${string}` })
          .then(balance => ({
            symbol: chainConfig.nativeToken.symbol,
            balance,
            decimals: chainConfig.nativeToken.decimals,
            isNative: true,
          }))
          .catch(() => ({
            symbol: chainConfig.nativeToken.symbol,
            balance: 0n,
            decimals: chainConfig.nativeToken.decimals,
            isNative: true,
          }))
      );

      // ERC20 balances
      for (const token of chainConfig.tokens) {
        if (token.address === '0x0000000000000000000000000000000000000000') continue;
        
        balancePromises.push(
          this.httpClient.readContract({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          })
            .then(balance => ({
              symbol: token.symbol,
              balance: balance as bigint,
              decimals: token.decimals,
              isNative: false,
            }))
            .catch(() => ({
              symbol: token.symbol,
              balance: 0n,
              decimals: token.decimals,
              isNative: false,
            }))
        );
      }

      const results = await Promise.all(balancePromises);

      // Get current prices for USD calculations
      const prices = store.prices;
      const maangPrice = prices.oraclePrice || prices.dmmPrice || 33;

      const tokenBalances: TokenBalance[] = results.map(result => {
        const formatted = Number(result.balance) / 10 ** result.decimals;
        let usdValue = 0;
        
        if (result.symbol === 'ETH') usdValue = formatted * 3567;
        else if (result.symbol === 'USDC' || result.symbol === 'mUSDC') usdValue = formatted;
        else if (result.symbol === 'MAANG') usdValue = formatted * maangPrice;
        
        return {
          symbol: result.symbol,
          balance: formatted.toFixed(4),
          decimals: result.decimals,
          usdValue: usdValue.toFixed(2),
          chainKey: 'etoMainnet',
          isNative: result.isNative,
        };
      });

      store.setBalances(address, tokenBalances);

    } catch (error) {
      console.error('[DataLayer] Balance fetch failed:', error);
    }
  }

  // ==========================================================================
  // Activity Fetching
  // ==========================================================================

  async refreshActivity(): Promise<void> {
    const store = useProtocolStore.getState();

    try {
      const currentBlock = await this.httpClient.getBlockNumber();
      const fromBlock = currentBlock - 1000n;

      // Fetch vault events
      const logs = await this.httpClient.getLogs({
        address: CONTRACTS.SMAANG_VAULT as `0x${string}`,
        fromBlock,
        toBlock: currentBlock,
      });

      const activities: ProtocolActivity[] = [];

      for (const log of logs.slice(-20)) {
        try {
          const block = await this.httpClient.getBlock({ blockNumber: log.blockNumber });
          const timestamp = Number(block.timestamp) * 1000;

          let type: ProtocolActivity['type'] = 'deposit';
          let description = 'Vault event';

          if (log.data && log.data.length > 200) {
            type = 'drip_execute';
            description = 'Drip executed';
          } else if (log.data && log.data.length > 130) {
            type = 'drip_commit';
            description = 'Drip committed';
          }

          activities.push({
            id: `${log.transactionHash}-${log.logIndex}`,
            type,
            description,
            txHash: log.transactionHash,
            blockNumber: Number(log.blockNumber),
            timestamp,
            timeAgo: formatDistanceToNow(timestamp, { addSuffix: true }),
          });
        } catch (e) {
          console.warn('[DataLayer] Failed to parse log:', e);
        }
      }

      activities.sort((a, b) => b.blockNumber - a.blockNumber);
      store.setActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('[DataLayer] Activity fetch failed:', error);
    }
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  getHttpClient() {
    return this.httpClient;
  }

  async manualRefresh(): Promise<void> {
    await Promise.all([
      this.refreshAllData(),
      this.refreshActivity(),
    ]);
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let dataLayerInstance: DataLayer | null = null;

export function getDataLayer(): DataLayer {
  if (!dataLayerInstance) {
    dataLayerInstance = new DataLayer();
  }
  return dataLayerInstance;
}

export function initializeDataLayer(): Promise<void> {
  return getDataLayer().connect();
}

export function destroyDataLayer(): void {
  if (dataLayerInstance) {
    dataLayerInstance.disconnect();
    dataLayerInstance = null;
  }
}

export function setUserAddress(address: string | null): void {
  getDataLayer().setUserAddress(address);
}

export function refreshData(): Promise<void> {
  return getDataLayer().manualRefresh();
}

export function refreshActivity(): Promise<void> {
  return getDataLayer().refreshActivity();
}

