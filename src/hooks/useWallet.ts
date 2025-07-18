
import { useState, useCallback, useEffect } from 'react';
import { useActiveAccount, useConnect, useDisconnect, useActiveWallet } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from '../lib/thirdweb';
import { useAuth } from '../contexts/AuthContext';

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateWalletAddress } = useAuth();
  
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Sync wallet address with auth context
  useEffect(() => {
    if (account?.address) {
      updateWalletAddress(account.address);
      localStorage.setItem('eto-wallet', account.address);
    }
  }, [account?.address, updateWalletAddress]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallet = createWallet("io.metamask");
      await connect(wallet);
      // Account will be available via useActiveAccount hook
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    try {
      if (activeWallet) {
        disconnect(activeWallet);
      }
      updateWalletAddress('');
      localStorage.removeItem('eto-wallet');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [disconnect, updateWalletAddress, activeWallet]);

  return {
    walletAddress: account?.address || user?.walletAddress,
    isConnecting,
    error,
    isMetaMaskInstalled: true, // thirdweb handles wallet detection
    connectWallet,
    disconnectWallet
  };
}
