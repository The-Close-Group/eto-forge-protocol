import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { client } from '@/lib/thirdweb';
import { useActiveAccount, useActiveWallet, useConnect } from 'thirdweb/react';
import { createWallet, type WalletId, injectedProvider } from 'thirdweb/wallets';

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
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Trusted multi-chain wallet',
    walletId: 'com.trustwallet.app',
  },
  {
    id: 'zerion',
    name: 'Zerion',
    icon: '💠',
    description: 'Portfolio and wallet in one',
    walletId: 'io.zerion.wallet',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Popular wallet (EVM extension supported)',
    walletId: 'app.phantom',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Scan a QR to connect any wallet',
    walletId: 'walletConnect',
  },
];

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
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

  // Silent auto-reconnect on load when a previous wallet type exists
  useEffect(() => {
    const prev = localStorage.getItem('eto-wallet-type');
    if (!prev || walletAddress) return;

    const mapToWalletId = (id: string): WalletId | null => {
      switch (id) {
        case 'metamask':
          return 'io.metamask';
        case 'coinbase':
          return 'com.coinbase.wallet';
        case 'rainbow':
          return 'me.rainbow';
        case 'trust':
          return 'com.trustwallet.app';
        case 'zerion':
          return 'io.zerion.wallet';
        case 'phantom':
          return 'app.phantom';
        case 'walletconnect':
          return 'walletConnect';
        default:
          return null;
      }
    };

    let cancelled = false;
    (async () => {
      setIsAutoConnecting(true);
      try {
        const walletIdentifier = mapToWalletId(prev);
        if (!walletIdentifier) return;
        const wallet = createWallet(walletIdentifier);
        if (walletIdentifier !== 'walletConnect' && injectedProvider(walletIdentifier)) {
          if (!cancelled) await wallet.connect({ client });
        } else if (walletIdentifier === 'walletConnect') {
          if (!cancelled) await wallet.connect({ client, walletConnect: { showQrModal: false } });
        }
      } catch {
        // silent
      } finally {
        setIsAutoConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

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
          case 'trust':
            walletIdentifier = 'com.trustwallet.app';
            break;
          case 'zerion':
            walletIdentifier = 'io.zerion.wallet';
            break;
          case 'phantom':
            walletIdentifier = 'app.phantom';
            break;
          case 'walletconnect':
            walletIdentifier = 'walletConnect';
            break;
          default:
            throw new Error(`Unsupported wallet type: ${walletId}`);
        }

        // Add a connection timeout to avoid infinite loading loops
        const connectOp = connect(async () => {
          const wallet = createWallet(walletIdentifier);

          // Prefer injected provider if available (fast path)
          if (walletIdentifier !== 'walletConnect' && injectedProvider(walletIdentifier)) {
            await wallet.connect({ client });
            return wallet;
          }

          // Special handling for Phantom: require extension
          if (walletIdentifier === 'app.phantom' && !injectedProvider('app.phantom')) {
            throw new Error('Phantom not detected. Please install it and try again');
          }

          // Mobile fallback: if user selected MetaMask (or other injected) but no provider, use WalletConnect
          if (walletIdentifier !== 'walletConnect' && !injectedProvider(walletIdentifier)) {
            await wallet.connect({
              client,
              walletConnect: { showQrModal: true },
            });
            return wallet;
          }

          // Default fallback
          await wallet.connect({
            client,
            walletConnect: { showQrModal: true },
          });
          return wallet;
        });
        const timeoutOp = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out')), 15_000)
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
        else if (lower.includes('not detected') || lower.includes('install')) message = raw;
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
    isAutoConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    resetConnectionState,
  };
}

