import { useEffect, ReactNode } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { initializeDataLayer, destroyDataLayer, setUserAddress } from '@/lib/dataLayer';
import { useProtocolStore } from '@/stores/protocolStore';

interface DataLayerProviderProps {
  children: ReactNode;
}

/**
 * DataLayerProvider - Initializes WebSocket + Multicall data layer
 * 
 * Place this high in the component tree to ensure real-time data
 * is available throughout the app.
 */
export function DataLayerProvider({ children }: DataLayerProviderProps) {
  const account = useActiveAccount();
  const isInitializing = useProtocolStore((state) => state.isInitializing);
  const connection = useProtocolStore((state) => state.connection);

  // Initialize data layer on mount
  useEffect(() => {
    console.log('[DataLayerProvider] Initializing real-time data layer...');
    initializeDataLayer();

    return () => {
      console.log('[DataLayerProvider] Cleaning up data layer...');
      destroyDataLayer();
    };
  }, []);

  // Update user address when wallet changes
  useEffect(() => {
    if (account?.address) {
      console.log('[DataLayerProvider] User address changed:', account.address);
      setUserAddress(account.address);
    } else {
      setUserAddress(null);
    }
  }, [account?.address]);

  // Log connection status changes
  useEffect(() => {
    if (connection.wsConnected && connection.rpcConnected) {
      console.log('[DataLayerProvider] ✓ Connected to ETO L1 (WebSocket + RPC)');
    } else if (connection.lastError) {
      console.warn('[DataLayerProvider] Connection error:', connection.lastError);
    }
  }, [connection.wsConnected, connection.rpcConnected, connection.lastError]);

  return <>{children}</>;
}

/**
 * Connection status indicator component
 */
export function ConnectionStatus() {
  const connection = useProtocolStore((state) => state.connection);
  const latestBlock = useProtocolStore((state) => state.latestBlock);

  if (!connection.wsConnected || !connection.rpcConnected) {
    return (
      <div className="flex items-center gap-2 text-xs text-yellow-500">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-emerald-500">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      Block #{latestBlock?.number?.toString() || '...'}
    </div>
  );
}

export default DataLayerProvider;

