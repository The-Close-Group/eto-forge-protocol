
import { useState, useCallback, useEffect } from 'react';
import { useActiveAccount, useActiveWallet, useConnect, useDisconnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
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
  
  const account = useActiveAccount();
  const wallet = useActiveWallet();
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

      const wallet = createWallet(walletOption.walletId);
      
      const connectedWallet = await connect(async () => {
        await wallet.connect({ client });
        return wallet;
      });

      if (connectedWallet) {
        localStorage.setItem('eto-wallet-type', walletId);
        setConnectedWalletType(walletId);
        setError(null);
      }
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      let errorMessage = 'Failed to connect wallet';
      
      if (err.message?.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user';
      } else if (err.message?.includes('popup')) {
        errorMessage = 'Please allow popups and try again';
      }
      
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    try {
      if (wallet) {
        disconnect(wallet);
      }
      localStorage.removeItem('eto-wallet-type');
      setConnectedWalletType('');
      setError(null);
    } catch (err: any) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [disconnect, wallet]);

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
