
import { useState, useCallback, useEffect } from 'react';
import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from '../lib/thirdweb';
import { useAuth } from '../contexts/AuthContext';

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  wallet: any;
}

export const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet',
    wallet: createWallet("io.metamask")
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet from Coinbase',
    wallet: createWallet("com.coinbase.wallet")
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect to mobile wallets',
    wallet: createWallet("walletConnect")
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Fun and simple wallet',
    wallet: createWallet("me.rainbow")
  }
];

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<string>('');
  
  const account = useActiveAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { updateWalletAddress } = useAuth();

  // Update auth context when wallet connection changes
  useEffect(() => {
    if (account?.address) {
      updateWalletAddress(account.address);
      const walletType = localStorage.getItem('eto-wallet-type') || 'metamask';
      setConnectedWalletType(walletType);
    } else {
      updateWalletAddress('');
      setConnectedWalletType('');
    }
  }, [account, updateWalletAddress]);

  const connectWallet = useCallback(async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const walletOption = WALLET_OPTIONS.find(w => w.id === walletId);
      if (!walletOption) {
        throw new Error('Wallet not found');
      }

      await connect(async () => {
        const wallet = walletOption.wallet;
        await wallet.connect({ client });
        return wallet;
      });

      localStorage.setItem('eto-wallet-type', walletId);
      setConnectedWalletType(walletId);
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    try {
      disconnect();
      localStorage.removeItem('eto-wallet-type');
      setConnectedWalletType('');
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [disconnect]);

  return {
    walletAddress: account?.address || null,
    connectedWalletType,
    isConnecting,
    error,
    isMetaMaskInstalled: true,
    connectWallet,
    disconnectWallet
  };
}
