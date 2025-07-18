
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  walletId: string;
}

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet',
    walletId: "io.metamask"
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet from Coinbase',
    walletId: "com.coinbase.wallet"
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect to mobile wallets',
    walletId: "walletConnect"
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Fun and simple wallet',
    walletId: "me.rainbow"
  }
];

// Mock wallet addresses for different wallet types
const MOCK_ADDRESSES = {
  metamask: '0x742d35Cc1E8D7a4f3c9b9f1B5A5c8e6F4f2B1A3E',
  coinbase: '0x8Ba1f109551bD432803012645Hac136c22C5c9',
  walletconnect: '0x123f7890AbCdEf123456789012345678901234567',
  rainbow: '0x456B1a2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A'
};

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { updateWalletAddress } = useAuth();

  // Load saved wallet state on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('eto-wallet');
    const savedWalletType = localStorage.getItem('eto-wallet-type');
    
    if (savedWallet && savedWalletType) {
      console.log('Loading saved wallet connection:', { address: savedWallet, type: savedWalletType });
      setWalletAddress(savedWallet);
      setConnectedWalletType(savedWalletType);
      updateWalletAddress(savedWallet);
    }
  }, [updateWalletAddress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const resetConnectionState = useCallback(() => {
    setIsConnecting(false);
    setError(null);
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  const connectWallet = useCallback(async (walletId: string) => {
    console.log('Starting mock wallet connection for:', walletId);
    
    // Reset any previous state
    resetConnectionState();
    setIsConnecting(true);
    setError(null);

    // Set connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      console.log('Wallet connection timeout');
      setIsConnecting(false);
      setError('Connection timeout. Please try again.');
    }, 30000); // 30 second timeout

    try {
      console.log('Simulating wallet connection...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Simulate random connection failures (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Connection failed randomly (simulated)');
      }
      
      // Get mock address for this wallet type
      const mockAddress = MOCK_ADDRESSES[walletId as keyof typeof MOCK_ADDRESSES];
      
      if (!mockAddress) {
        throw new Error(`Unsupported wallet type: ${walletId}`);
      }
      
      console.log('Mock wallet connected successfully:', { walletId, address: mockAddress });
      
      // Update state
      setWalletAddress(mockAddress);
      setConnectedWalletType(walletId);
      updateWalletAddress(mockAddress);
      
      // Save to localStorage
      localStorage.setItem('eto-wallet', mockAddress);
      localStorage.setItem('eto-wallet-type', walletId);
      
      // Clear timeout on success
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
    } catch (err: any) {
      console.error('Mock wallet connection error:', err);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
        errorMessage = 'Connection cancelled by user';
      } else if (err.message?.includes('popup')) {
        errorMessage = 'Please allow popups and try again';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please try again.';
      } else if (err.message?.includes('not found') || err.message?.includes('not installed')) {
        errorMessage = `${WALLET_OPTIONS.find(w => w.id === walletId)?.name || 'Wallet'} not found. Please install it first.`;
      }
      
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    }
  }, [resetConnectionState, updateWalletAddress]);

  const disconnectWallet = useCallback(async () => {
    console.log('Disconnecting mock wallet...');
    
    try {
      setWalletAddress(null);
      setConnectedWalletType('');
      updateWalletAddress('');
      setError(null);
      
      // Clear localStorage
      localStorage.removeItem('eto-wallet');
      localStorage.removeItem('eto-wallet-type');
      
      console.log('Mock wallet disconnected successfully');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
    }
  }, [updateWalletAddress]);

  return {
    walletAddress,
    connectedWalletType,
    isConnecting,
    error,
    isMetaMaskInstalled: true,
    connectWallet,
    disconnectWallet,
    resetConnectionState
  };
}
