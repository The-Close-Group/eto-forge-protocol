
import { useState, useCallback, useEffect, useRef } from 'react';
import { useActiveAccount, useActiveWallet, useConnect, useDisconnect } from "thirdweb/react";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";
import { client } from '../lib/thirdweb';
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

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<string>('');
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { updateWalletAddress } = useAuth();

  // Update auth context when wallet connection changes
  useEffect(() => {
    console.log('Wallet connection state changed:', { 
      accountAddress: account?.address, 
      walletConnected: !!wallet 
    });
    
    if (account?.address) {
      updateWalletAddress(account.address);
      const walletType = localStorage.getItem('eto-wallet-type') || 'metamask';
      setConnectedWalletType(walletType);
      console.log('Wallet connected successfully:', { address: account.address, type: walletType });
    } else {
      updateWalletAddress('');
      setConnectedWalletType('');
      console.log('Wallet disconnected');
    }
  }, [account?.address, wallet, updateWalletAddress]);

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
    console.log('Starting wallet connection for:', walletId);
    
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
      let wallet;
      
      console.log('Creating wallet instance for:', walletId);
      
      // Create wallet based on the selected type
      switch (walletId) {
        case 'metamask':
          wallet = createWallet("io.metamask");
          break;
        case 'coinbase':
          wallet = createWallet("com.coinbase.wallet");
          break;
        case 'walletconnect':
          wallet = walletConnect();
          break;
        case 'rainbow':
          wallet = createWallet("me.rainbow");
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletId}`);
      }
      
      console.log('Wallet instance created, attempting connection...');
      
      const connectedWallet = await connect(async () => {
        console.log('Connecting wallet...');
        await wallet.connect({ client });
        console.log('Wallet connected successfully');
        return wallet;
      });

      if (connectedWallet) {
        localStorage.setItem('eto-wallet-type', walletId);
        setConnectedWalletType(walletId);
        console.log('Connection completed successfully for:', walletId);
        
        // Clear timeout on success
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      }
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      
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
  }, [connect, resetConnectionState]);

  const disconnectWallet = useCallback(async () => {
    console.log('Disconnecting wallet...');
    
    try {
      if (wallet) {
        disconnect(wallet);
      }
      localStorage.removeItem('eto-wallet-type');
      setConnectedWalletType('');
      setError(null);
      console.log('Wallet disconnected successfully');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
    }
  }, [disconnect, wallet]);

  return {
    walletAddress: account?.address || null,
    connectedWalletType,
    isConnecting,
    error,
    isMetaMaskInstalled: true,
    connectWallet,
    disconnectWallet,
    resetConnectionState
  };
}
