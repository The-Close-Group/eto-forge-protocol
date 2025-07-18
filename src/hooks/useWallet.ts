
import { useState, useCallback } from 'react';
import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { client } from '../lib/thirdweb';
import { useAuth } from '../contexts/AuthContext';

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateWalletAddress } = useAuth();
  
  const account = useActiveAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallet = createWallet("io.metamask");
      const account = await connect(() => wallet);
      
      if (account) {
        updateWalletAddress(account.address);
        localStorage.setItem('eto-wallet', account.address);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [connect, updateWalletAddress]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      updateWalletAddress('');
      localStorage.removeItem('eto-wallet');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [disconnect, updateWalletAddress]);

  return {
    walletAddress: account?.address || user?.walletAddress,
    isConnecting,
    error,
    isMetaMaskInstalled: true, // thirdweb handles wallet detection
    connectWallet,
    disconnectWallet
  };
}
