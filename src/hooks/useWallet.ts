import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { client } from '@/lib/thirdweb';
import { useActiveAccount, useActiveWallet, useConnect } from 'thirdweb/react';
import { createWallet, type WalletId } from 'thirdweb/wallets';

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
    walletId: 'io.metamask',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Secure wallet from Coinbase',
    walletId: 'com.coinbase.wallet',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Fun and simple wallet',
    walletId: 'me.rainbow',
  },
];

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<string>(
    localStorage.getItem('eto-wallet-type') || ''
  );
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('eto-wallet') || null
  );

  const { updateWalletAddress } = useAuth();

  const account = useActiveAccount();
  const { connect } = useConnect();
  const activeWallet = useActiveWallet();

  useEffect(() => {
    if (account?.address) {
      setWalletAddress(account.address);
      updateWalletAddress(account.address);
      localStorage.setItem('eto-wallet', account.address);
    } else {
      setWalletAddress(null);
      updateWalletAddress('');
      localStorage.removeItem('eto-wallet');
    }
  }, [account?.address, updateWalletAddress]);

  const resetConnectionState = useCallback(() => {
    setIsConnecting(false);
    setError(null);
  }, []);

  const connectWallet = useCallback(
    async (walletId: string) => {
      setIsConnecting(true);
      setError(null);
      try {
        let walletIdentifier: WalletId;
        switch (walletId) {
          case 'metamask':
            walletIdentifier = 'io.metamask';
            break;
          case 'coinbase':
            walletIdentifier = 'com.coinbase.wallet';
            break;
          case 'rainbow':
            walletIdentifier = 'me.rainbow';
            break;
          case 'walletconnect':
            throw new Error('WalletConnect is not configured for this app');
          default:
            throw new Error(`Unsupported wallet type: ${walletId}`);
        }

        // Pre-flight checks for browser injected wallets
        if (walletId === 'metamask') {
          const hasEthereum = typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask;
          if (!hasEthereum) {
            throw new Error('MetaMask not detected');
          }
        }

        // Add a connection timeout to avoid infinite loading loops
        const connectOp = connect(async () => {
          const wallet = createWallet(walletIdentifier);
          await wallet.connect({ client });
          return wallet;
        });
        const timeoutOp = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out')), 30_000)
        );

        await Promise.race([connectOp, timeoutOp]);

        setConnectedWalletType(walletId);
        localStorage.setItem('eto-wallet-type', walletId);
      } catch (err: any) {
        const raw = String(err?.message || err || 'Failed to connect wallet');
        let message = 'Failed to connect wallet';
        const lower = raw.toLowerCase();
        if (lower.includes('rejected') || lower.includes('user closed') || lower.includes('user rejected')) message = 'Connection cancelled by user';
        else if (lower.includes('popup')) message = 'Please allow popups and try again';
        else if (lower.includes('configured')) message = raw;
        else if (lower.includes('timed out') || lower.includes('timeout')) message = 'Connection timed out. Please try again';
        else if (lower.includes('not detected') || lower.includes('metamask')) message = 'MetaMask not detected. Please install it and try again';
        setError(message);
      } finally {
        setIsConnecting(false);
      }
    },
    [connect]
  );

  const disconnectWallet = useCallback(
    async () => {
      try {
        if (activeWallet) {
          await activeWallet.disconnect();
        }
      } catch {
        // noop
      }
      setConnectedWalletType('');
      setError(null);
      setIsConnecting(false);
      setWalletAddress(null);
      updateWalletAddress('');
      localStorage.removeItem('eto-wallet');
      localStorage.removeItem('eto-wallet-type');
    },
    [activeWallet, updateWalletAddress]
  );

  const isMetaMaskInstalled =
    typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask === true;

  return {
    walletAddress,
    connectedWalletType,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    resetConnectionState,
  };
}

