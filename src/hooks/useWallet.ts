
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet from Coinbase'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect to mobile wallets'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Fun and simple wallet'
  }
];

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const { user, updateWalletAddress } = useAuth();

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('eto-wallet');
    if (savedWallet) {
      setConnectedWallet(savedWallet);
      updateWalletAddress(savedWallet);
    }
  }, [updateWalletAddress]);

  const generateMockAddress = () => {
    // Generate a mock Ethereum address
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };

  const connectWallet = useCallback(async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      // Simulate occasional connection failures
      if (Math.random() < 0.1) {
        throw new Error('Connection failed. Please try again.');
      }

      const mockAddress = generateMockAddress();
      setConnectedWallet(mockAddress);
      updateWalletAddress(mockAddress);
      localStorage.setItem('eto-wallet', mockAddress);
      localStorage.setItem('eto-wallet-type', walletId);
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [updateWalletAddress]);

  const disconnectWallet = useCallback(async () => {
    try {
      setConnectedWallet(null);
      updateWalletAddress('');
      localStorage.removeItem('eto-wallet');
      localStorage.removeItem('eto-wallet-type');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [updateWalletAddress]);

  const getConnectedWalletType = () => {
    return localStorage.getItem('eto-wallet-type') || 'metamask';
  };

  return {
    walletAddress: connectedWallet || user?.walletAddress,
    connectedWalletType: getConnectedWalletType(),
    isConnecting,
    error,
    isMetaMaskInstalled: true, // Always true for mock
    connectWallet,
    disconnectWallet
  };
}
