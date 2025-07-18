
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateWalletAddress } = useAuth();

  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        updateWalletAddress(address);
        localStorage.setItem('eto-wallet', address);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled, updateWalletAddress]);

  const disconnectWallet = useCallback(() => {
    updateWalletAddress('');
    localStorage.removeItem('eto-wallet');
  }, [updateWalletAddress]);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedWallet = localStorage.getItem('eto-wallet');
    if (savedWallet && user && !user.walletAddress) {
      updateWalletAddress(savedWallet);
    }
  }, [user, updateWalletAddress]);

  return {
    walletAddress: user?.walletAddress,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet
  };
}
