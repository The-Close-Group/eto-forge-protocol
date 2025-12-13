import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// =============================================================================
// Protocol Store - Single Source of Truth for All Real-Time Data
// =============================================================================

export interface PriceData {
  oraclePrice: number;
  oracleTimestamp: number;
  dmmPrice: number;
  priceDeviation: number;
  lastUpdated: number;
}

export interface ProtocolStats {
  totalLiquidity: number;
  dmmDriBalance: number;
  dmmUsdcBalance: number;
  dmmPaused: boolean;
  vaultTotalAssets: number;
  vaultTotalSupply: number;
  vaultSharePrice: number;
  tvl: number;
  isHealthy: boolean;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  usdValue: string;
  chainKey: string;
  isNative: boolean;
}

export interface ProtocolActivity {
  id: string;
  type: 'swap' | 'drip_commit' | 'drip_execute' | 'deposit' | 'withdraw' | 'sync';
  description: string;
  amount?: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  timeAgo: string;
}

export interface BlockInfo {
  number: bigint;
  timestamp: number;
  hash: string;
}

export interface ConnectionState {
  wsConnected: boolean;
  rpcConnected: boolean;
  lastError: string | null;
  reconnectAttempts: number;
}

export interface GraphQLCacheEntry<T> {
  data: T;
  timestamp: number;
  queryKey: string;
}

export interface GraphQLCache {
  entries: Map<string, GraphQLCacheEntry<unknown>>;
  maxAge: number; // milliseconds
}

interface ProtocolState {
  connection: ConnectionState;
  latestBlock: BlockInfo | null;
  prices: PriceData;
  stats: ProtocolStats;
  balances: Map<string, TokenBalance[]>;
  activities: ProtocolActivity[];
  priceHistory: Array<{ timestamp: number; oraclePrice: number; dmmPrice: number }>;
  graphQLCache: GraphQLCache;
  isInitializing: boolean;
  isRefreshing: boolean;

  setConnection: (connection: Partial<ConnectionState>) => void;
  setLatestBlock: (block: BlockInfo) => void;
  setPrices: (prices: Partial<PriceData>) => void;
  setStats: (stats: Partial<ProtocolStats>) => void;
  setBalances: (address: string, balances: TokenBalance[]) => void;
  addActivity: (activity: ProtocolActivity) => void;
  setActivities: (activities: ProtocolActivity[]) => void;
  addPriceHistoryPoint: (point: { timestamp: number; oraclePrice: number; dmmPrice: number }) => void;
  setPriceHistory: (history: Array<{ timestamp: number; oraclePrice: number; dmmPrice: number }>) => void;
  setInitializing: (isInitializing: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  updateFromMulticall: (data: {
    prices?: Partial<PriceData>;
    stats?: Partial<ProtocolStats>;
    balances?: { address: string; balances: TokenBalance[] };
  }) => void;
  // GraphQL cache methods
  setGraphQLCache: <T>(key: string, data: T, maxAge?: number) => void;
  getGraphQLCache: <T>(key: string) => T | null;
  clearGraphQLCache: (key?: string) => void;
  reset: () => void;
}

const initialPrices: PriceData = {
  oraclePrice: 0,
  oracleTimestamp: 0,
  dmmPrice: 0,
  priceDeviation: 0,
  lastUpdated: 0,
};

const initialStats: ProtocolStats = {
  totalLiquidity: 0,
  dmmDriBalance: 0,
  dmmUsdcBalance: 0,
  dmmPaused: false,
  vaultTotalAssets: 0,
  vaultTotalSupply: 0,
  vaultSharePrice: 1,
  tvl: 0,
  isHealthy: true,
};

const initialConnection: ConnectionState = {
  wsConnected: false,
  rpcConnected: false,
  lastError: null,
  reconnectAttempts: 0,
};

const MAX_PRICE_HISTORY = 1000;
const MAX_ACTIVITIES = 50;

export const useProtocolStore = create<ProtocolState>()(
  subscribeWithSelector((set, get) => ({
    connection: initialConnection,
    latestBlock: null,
    prices: initialPrices,
    stats: initialStats,
    balances: new Map(),
    activities: [],
    priceHistory: [],
    graphQLCache: {
      entries: new Map(),
      maxAge: 5 * 60 * 1000, // 5 minutes default
    },
    isInitializing: true,
    isRefreshing: false,

    setConnection: (connection) =>
      set((state) => ({
        connection: { ...state.connection, ...connection },
      })),

    setLatestBlock: (block) => set({ latestBlock: block }),

    setPrices: (prices) =>
      set((state) => ({
        prices: { ...state.prices, ...prices, lastUpdated: Date.now() },
      })),

    setStats: (stats) =>
      set((state) => ({
        stats: { ...state.stats, ...stats },
      })),

    setBalances: (address, balances) =>
      set((state) => {
        const newBalances = new Map(state.balances);
        newBalances.set(address.toLowerCase(), balances);
        return { balances: newBalances };
      }),

    addActivity: (activity) =>
      set((state) => {
        if (state.activities.some((a) => a.id === activity.id)) {
          return state;
        }
        const newActivities = [activity, ...state.activities].slice(0, MAX_ACTIVITIES);
        return { activities: newActivities };
      }),

    setActivities: (activities) =>
      set({ activities: activities.slice(0, MAX_ACTIVITIES) }),

    addPriceHistoryPoint: (point) =>
      set((state) => {
        const newHistory = [...state.priceHistory, point].slice(-MAX_PRICE_HISTORY);
        return { priceHistory: newHistory };
      }),

    setPriceHistory: (history) =>
      set({ priceHistory: history.slice(-MAX_PRICE_HISTORY) }),

    setInitializing: (isInitializing) => set({ isInitializing }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),

    updateFromMulticall: (data) =>
      set((state) => {
        const updates: Partial<ProtocolState> = {};

        if (data.prices) {
          updates.prices = { ...state.prices, ...data.prices, lastUpdated: Date.now() };
          if (data.prices.oraclePrice || data.prices.dmmPrice) {
            const newPoint = {
              timestamp: Date.now(),
              oraclePrice: data.prices.oraclePrice ?? state.prices.oraclePrice,
              dmmPrice: data.prices.dmmPrice ?? state.prices.dmmPrice,
            };
            updates.priceHistory = [...state.priceHistory, newPoint].slice(-MAX_PRICE_HISTORY);
          }
        }

        if (data.stats) {
          updates.stats = { ...state.stats, ...data.stats };
        }

        if (data.balances) {
          const newBalances = new Map(state.balances);
          newBalances.set(data.balances.address.toLowerCase(), data.balances.balances);
          updates.balances = newBalances;
        }

        return updates;
      }),

    setGraphQLCache: <T>(key: string, data: T, maxAge?: number) =>
      set((state) => {
        const cache = new Map(state.graphQLCache.entries);
        cache.set(key, {
          data,
          timestamp: Date.now(),
          queryKey: key,
        });
        return {
          graphQLCache: {
            entries: cache,
            maxAge: maxAge ?? state.graphQLCache.maxAge,
          },
        };
      }),

    getGraphQLCache: <T>(key: string): T | null => {
      const state = get();
      const entry = state.graphQLCache.entries.get(key);
      if (!entry) return null;

      const age = Date.now() - entry.timestamp;
      if (age > state.graphQLCache.maxAge) {
        // Expired - remove it
        const cache = new Map(state.graphQLCache.entries);
        cache.delete(key);
        set({ graphQLCache: { ...state.graphQLCache, entries: cache } });
        return null;
      }

      return entry.data as T;
    },

    clearGraphQLCache: (key?: string) =>
      set((state) => {
        if (key) {
          const cache = new Map(state.graphQLCache.entries);
          cache.delete(key);
          return { graphQLCache: { ...state.graphQLCache, entries: cache } };
        }
        return { graphQLCache: { entries: new Map(), maxAge: state.graphQLCache.maxAge } };
      }),

    reset: () =>
      set({
        connection: initialConnection,
        latestBlock: null,
        prices: initialPrices,
        stats: initialStats,
        balances: new Map(),
        activities: [],
        priceHistory: [],
        graphQLCache: { entries: new Map(), maxAge: 5 * 60 * 1000 },
        isInitializing: true,
        isRefreshing: false,
      }),
  }))
);

// Selectors
export const selectOraclePrice = (state: ProtocolState) => state.prices.oraclePrice;
export const selectDmmPrice = (state: ProtocolState) => state.prices.dmmPrice;
export const selectPriceDeviation = (state: ProtocolState) => state.prices.priceDeviation;
export const selectPrices = (state: ProtocolState) => state.prices;
export const selectTvl = (state: ProtocolState) => state.stats.tvl;
export const selectTotalLiquidity = (state: ProtocolState) => state.stats.totalLiquidity;
export const selectVaultSharePrice = (state: ProtocolState) => state.stats.vaultSharePrice;
export const selectIsHealthy = (state: ProtocolState) => state.stats.isHealthy;
export const selectStats = (state: ProtocolState) => state.stats;
export const selectBalances = (address: string) => (state: ProtocolState) =>
  state.balances.get(address.toLowerCase()) ?? [];
export const selectActivities = (state: ProtocolState) => state.activities;
export const selectLatestBlock = (state: ProtocolState) => state.latestBlock;
export const selectConnection = (state: ProtocolState) => state.connection;
export const selectIsConnected = (state: ProtocolState) =>
  state.connection.wsConnected && state.connection.rpcConnected;
export const selectIsInitializing = (state: ProtocolState) => state.isInitializing;
export const selectIsRefreshing = (state: ProtocolState) => state.isRefreshing;
export const selectPriceHistory = (state: ProtocolState) => state.priceHistory;
export const selectGraphQLCache = (state: ProtocolState) => state.graphQLCache;
