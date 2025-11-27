import { useState, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { etoPublicClient } from '@/lib/etoRpc';
import { USDC_ADDRESS, SMAANG_VAULT_ADDRESS, DRI_TOKEN_ADDRESS } from '@/config/contracts';

const EXPLORER_URL = 'https://eto-explorer.ash.center';

// Vault ABI for staking functions
const VAULT_ABI = [
  {
    inputs: [
      { name: 'usdcIn', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    name: 'depositUSDC',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'maangIn', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    name: 'depositMAANG',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    name: 'withdraw',
    outputs: [{ name: 'maangOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'assets', type: 'uint256' }],
    name: 'previewDeposit',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'depositsPaused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Helper to get window.ethereum
const getEthereumProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
};

export function useVaultStaking() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Check token allowance
  const checkAllowance = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    console.log('[useVaultStaking] checkAllowance called', { tokenAddress, amount: amount.toString() });
    if (!account?.address) {
      console.log('[useVaultStaking] No account in checkAllowance');
      return false;
    }
    try {
      const allowance = await etoPublicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address as `0x${string}`, SMAANG_VAULT_ADDRESS as `0x${string}`],
      });
      console.log('[useVaultStaking] Current allowance:', allowance.toString(), 'Required:', amount.toString());
      const isApproved = allowance >= amount;
      console.log('[useVaultStaking] Is approved:', isApproved);
      return isApproved;
    } catch (error) {
      console.error('[Vault] Allowance check failed:', error);
      return false;
    }
  }, [account]);

  // Approve token spending
  const approveToken = useCallback(async (tokenAddress: string, amount: bigint): Promise<boolean> => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return false;
    }

    try {
      const provider = getEthereumProvider();
      if (!provider) {
        toast.error('No wallet detected');
        return false;
      }

      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');

      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });

      const hash = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SMAANG_VAULT_ADDRESS as `0x${string}`, amount],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 100_000n,
      });

      toast.success('Approval sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });

      if (receipt.status === 'success') {
        toast.success(`Token approved! View: ${EXPLORER_URL}/tx/${hash}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('[Vault] Approval failed:', error);
      if (error.code === 4001) {
        toast.error('Approval rejected by user');
      } else {
        toast.error('Approval failed: ' + (error.shortMessage || error.message));
      }
      return false;
    }
  }, [account]);

  // Get user's vault shares
  const getVaultShares = useCallback(async (): Promise<bigint> => {
    if (!account?.address) return 0n;
    try {
      return await etoPublicClient.readContract({
        address: SMAANG_VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'balanceOf',
        args: [account.address as `0x${string}`],
      });
    } catch (error) {
      console.error('[Vault] Failed to get shares:', error);
      return 0n;
    }
  }, [account]);

  // Get vault stats
  const getVaultStats = useCallback(async () => {
    try {
      const [totalAssets, totalSupply, depositsPaused] = await Promise.all([
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'totalAssets',
        }),
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'totalSupply',
        }),
        etoPublicClient.readContract({
          address: SMAANG_VAULT_ADDRESS as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'depositsPaused',
        }),
      ]);

      const sharePrice = totalSupply > 0n 
        ? Number(totalAssets) / Number(totalSupply) 
        : 1;

      return {
        totalAssets,
        totalSupply,
        sharePrice,
        depositsPaused,
      };
    } catch (error) {
      console.error('[Vault] Failed to get stats:', error);
      return null;
    }
  }, []);

  // Deposit USDC into vault
  const depositUSDC = useCallback(async (usdcAmount: string): Promise<string | null> => {
    console.log('[depositUSDC] Called with', { usdcAmount, account: account?.address });
    
    if (!account?.address) {
      console.log('[depositUSDC] No account');
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      const usdcAmt = BigInt(Math.floor(parseFloat(usdcAmount) * 1e6));
      console.log('[depositUSDC] USDC amount in wei:', usdcAmt.toString());

      // Check balance first
      const balance = await etoPublicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address as `0x${string}`],
      });
      console.log('[depositUSDC] USDC balance:', balance.toString(), 'Required:', usdcAmt.toString());
      
      if (balance < usdcAmt) {
        const balanceFormatted = (Number(balance) / 1e6).toFixed(2);
        toast.error(`Insufficient USDC! You have ${balanceFormatted} but need ${usdcAmount}`);
        setIsLoading(false);
        return null;
      }

      // Check and approve USDC
      console.log('[depositUSDC] Checking allowance...');
      const usdcApproved = await checkAllowance(USDC_ADDRESS, usdcAmt);
      console.log('[depositUSDC] Allowance check result:', usdcApproved);
      
      if (!usdcApproved) {
        console.log('[depositUSDC] Need approval...');
        const approved = await approveToken(USDC_ADDRESS, usdcAmt);
        if (!approved) {
          console.log('[depositUSDC] Approval failed');
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const recheck = await checkAllowance(USDC_ADDRESS, usdcAmt);
        if (!recheck) {
          toast.error('USDC approval not detected. Please try again.');
          return null;
        }
      }

      console.log('[depositUSDC] Getting provider...');
      const provider = getEthereumProvider();
      if (!provider) {
        console.log('[depositUSDC] No provider!');
        toast.error('No wallet detected');
        return null;
      }
      console.log('[depositUSDC] Provider found');

      console.log('[depositUSDC] Importing viem...');
      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');
      console.log('[depositUSDC] Creating wallet client...');

      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      console.log('[depositUSDC] Switching chain...');
      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
        console.log('[depositUSDC] Chain switched');
      } catch (switchError: any) {
        console.log('[depositUSDC] Switch error:', switchError.code);
        if (switchError.code === 4902) {
          console.log('[depositUSDC] Adding chain...');
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      console.log('[depositUSDC] Getting nonce...');
      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });
      console.log('[depositUSDC] Nonce:', nonce);

      console.log('[depositUSDC] Sending transaction to vault:', SMAANG_VAULT_ADDRESS);
      console.log('[depositUSDC] Args:', { usdcAmt: usdcAmt.toString(), to: account.address, nonce, gas: '500000' });
      
      const hash = await walletClient.writeContract({
        address: SMAANG_VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'depositUSDC',
        args: [usdcAmt, account.address as `0x${string}`],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 500_000n,
      });

      console.log('[depositUSDC] Transaction sent! Hash:', hash);
      toast.success('Deposit sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
      console.log('[depositUSDC] Receipt status:', receipt.status);

      if (receipt.status === 'success') {
        toast.success(`Successfully deposited USDC into vault! View: ${EXPLORER_URL}/tx/${hash}`);
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['vault-shares'] });
        queryClient.invalidateQueries({ queryKey: ['staking-balances'] });
        return hash;
      } else {
        console.error('[depositUSDC] TX FAILED on-chain! Check explorer:', `${EXPLORER_URL}/tx/${hash}`);
        toast.error(`Deposit failed on-chain. Check explorer: ${EXPLORER_URL}/tx/${hash}`);
        return null;
      }
    } catch (error: any) {
      console.error('[Vault] USDC Deposit error:', error);
      console.error('[Vault] Error details:', JSON.stringify(error, null, 2));
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('Deposits paused')) {
        toast.error('Vault deposits are currently paused');
      } else if (error.message?.includes('Spot price')) {
        toast.error('Price deviation too high. Please try again later.');
      } else if (error.message?.includes('0xe450d38c') || error.message?.includes('InsufficientBalance')) {
        toast.error('Insufficient USDC balance for this deposit');
      } else if (error.message?.includes('0xfb8f41b2') || error.message?.includes('InsufficientAllowance')) {
        toast.error('USDC allowance too low. Please approve first.');
      } else {
        const errMsg = error.shortMessage || error.message || error.reason || 'Deposit failed';
        console.error('[Vault] Showing error:', errMsg);
        toast.error('USDC Deposit failed: ' + errMsg);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, checkAllowance, approveToken, queryClient]);

  // Deposit DRI/MAANG into vault
  const depositDRI = useCallback(async (driAmount: string): Promise<string | null> => {
    console.log('[useVaultStaking] depositDRI called', { driAmount, account: account?.address });
    
    if (!account?.address) {
      console.log('[useVaultStaking] No account');
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      const driAmt = BigInt(Math.floor(parseFloat(driAmount) * 1e18));
      console.log('[useVaultStaking] MAANG amount in wei:', driAmt.toString());

      // Check balance first
      const balance = await etoPublicClient.readContract({
        address: DRI_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address as `0x${string}`],
      });
      console.log('[useVaultStaking] MAANG balance:', balance.toString(), 'Required:', driAmt.toString());
      
      if (balance < driAmt) {
        const balanceFormatted = (Number(balance) / 1e18).toFixed(6);
        toast.error(`Insufficient MAANG! You have ${balanceFormatted} but need ${driAmount}`);
        setIsLoading(false);
        return null;
      }

      // Check and approve DRI
      console.log('[useVaultStaking] Checking MAANG allowance...');
      const driApproved = await checkAllowance(DRI_TOKEN_ADDRESS, driAmt);
      console.log('[useVaultStaking] MAANG allowance check result:', driApproved);
      
      if (!driApproved) {
        console.log('[useVaultStaking] Need to approve MAANG...');
        const approved = await approveToken(DRI_TOKEN_ADDRESS, driAmt);
        console.log('[useVaultStaking] Approval result:', approved);
        if (!approved) {
          console.log('[useVaultStaking] Approval failed, returning null');
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        const recheck = await checkAllowance(DRI_TOKEN_ADDRESS, driAmt);
        console.log('[useVaultStaking] Recheck allowance:', recheck);
        if (!recheck) {
          toast.error('DRI approval not detected. Please try again.');
          return null;
        }
      }

      console.log('[useVaultStaking] Getting provider...');
      const provider = getEthereumProvider();
      if (!provider) {
        console.log('[useVaultStaking] No provider!');
        toast.error('No wallet detected');
        return null;
      }
      console.log('[useVaultStaking] Provider found');

      console.log('[useVaultStaking] Importing viem...');
      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');

      console.log('[useVaultStaking] Creating wallet client...');
      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      console.log('[useVaultStaking] Switching chain...');
      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
        console.log('[useVaultStaking] Chain switched');
      } catch (switchError: any) {
        console.log('[useVaultStaking] Switch error:', switchError.code);
        if (switchError.code === 4902) {
          console.log('[useVaultStaking] Adding chain...');
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      console.log('[useVaultStaking] Getting nonce...');
      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });
      console.log('[useVaultStaking] Nonce:', nonce);

      console.log('[useVaultStaking] Sending depositMAANG transaction...');
      const hash = await walletClient.writeContract({
        address: SMAANG_VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'depositMAANG',
        args: [driAmt, account.address as `0x${string}`],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 500_000n,
      });

      toast.success('Deposit sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
      console.log('[depositDRI] Receipt status:', receipt.status);

      if (receipt.status === 'success') {
        toast.success(`Successfully deposited MAANG into vault! View: ${EXPLORER_URL}/tx/${hash}`);
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['vault-shares'] });
        queryClient.invalidateQueries({ queryKey: ['staking-balances'] });
        return hash;
      } else {
        console.error('[depositDRI] TX FAILED on-chain! Check explorer:', `${EXPLORER_URL}/tx/${hash}`);
        toast.error(`Deposit failed on-chain. Check explorer: ${EXPLORER_URL}/tx/${hash}`);
        return null;
      }
    } catch (error: any) {
      console.error('[Vault] MAANG Deposit error:', error);
      console.error('[Vault] Error details:', JSON.stringify(error, null, 2));
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('Deposits paused')) {
        toast.error('Vault deposits are currently paused');
      } else if (error.message?.includes('Spot price')) {
        toast.error('Price deviation too high. Please try again later.');
      } else if (error.message?.includes('0xe450d38c') || error.message?.includes('InsufficientBalance')) {
        toast.error('Insufficient MAANG balance for this deposit');
      } else if (error.message?.includes('0xfb8f41b2') || error.message?.includes('InsufficientAllowance')) {
        toast.error('MAANG allowance too low. Please approve first.');
      } else {
        const errMsg = error.shortMessage || error.message || error.reason || 'Deposit failed';
        console.error('[Vault] Showing error:', errMsg);
        toast.error('MAANG Deposit failed: ' + errMsg);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, checkAllowance, approveToken, queryClient]);

  // Withdraw vault shares for DRI
  const redeemShares = useCallback(async (shares: string): Promise<string | null> => {
    console.log('[withdraw] Called with', { shares, account: account?.address });
    
    if (!account?.address) {
      console.log('[withdraw] No account');
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      const sharesAmt = BigInt(Math.floor(parseFloat(shares) * 1e18));
      console.log('[withdraw] Shares amount in wei:', sharesAmt.toString());

      // Check user has enough shares
      console.log('[withdraw] Checking user shares...');
      const userShares = await getVaultShares();
      console.log('[withdraw] User shares:', userShares.toString(), 'Required:', sharesAmt.toString());
      
      if (userShares < sharesAmt) {
        console.log('[withdraw] Insufficient shares');
        toast.error('Insufficient vault shares');
        setIsLoading(false);
        return null;
      }

      console.log('[withdraw] Getting provider...');
      const provider = getEthereumProvider();
      if (!provider) {
        console.log('[withdraw] No provider');
        toast.error('No wallet detected');
        setIsLoading(false);
        return null;
      }
      console.log('[withdraw] Provider found');

      console.log('[withdraw] Importing viem...');
      const { createWalletClient, custom } = await import('viem');
      const { etoL1Chain } = await import('@/lib/etoRpc');

      console.log('[withdraw] Creating wallet client...');
      const walletClient = createWalletClient({
        chain: etoL1Chain,
        transport: custom(provider),
      });

      console.log('[withdraw] Switching chain...');
      try {
        await walletClient.switchChain({ id: etoL1Chain.id });
        console.log('[withdraw] Chain switched');
      } catch (switchError: any) {
        console.log('[withdraw] Switch error:', switchError.code);
        if (switchError.code === 4902) {
          console.log('[withdraw] Adding chain...');
          await walletClient.addChain({ chain: etoL1Chain });
        } else {
          throw switchError;
        }
      }

      console.log('[withdraw] Getting nonce...');
      const nonce = await etoPublicClient.getTransactionCount({
        address: account.address as `0x${string}`,
        blockTag: 'pending',
      });
      console.log('[withdraw] Nonce:', nonce);

      console.log('[withdraw] Sending withdraw transaction to vault:', SMAANG_VAULT_ADDRESS);
      console.log('[withdraw] Args:', { sharesAmt: sharesAmt.toString(), to: account.address, nonce, gas: '500000' });
      
      const hash = await walletClient.writeContract({
        address: SMAANG_VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [sharesAmt, account.address as `0x${string}`],
        account: account.address as `0x${string}`,
        chain: etoL1Chain,
        nonce,
        gas: 500_000n,
      });
      console.log('[withdraw] Transaction sent! Hash:', hash);

      toast.success('Withdrawal sent! Waiting for confirmation...');
      const receipt = await etoPublicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
      console.log('[withdraw] Receipt status:', receipt.status);

      if (receipt.status === 'success') {
        toast.success(`Successfully withdrew from vault! MAANG sent to your wallet. View: ${EXPLORER_URL}/tx/${hash}`);
        queryClient.invalidateQueries({ queryKey: ['multi-chain-balances'] });
        queryClient.invalidateQueries({ queryKey: ['vault-shares'] });
        queryClient.invalidateQueries({ queryKey: ['staking-balances'] });
        return hash;
      } else {
        console.error('[withdraw] TX FAILED on-chain! Check explorer:', `${EXPLORER_URL}/tx/${hash}`);
        toast.error(`Withdrawal failed on-chain. Check explorer: ${EXPLORER_URL}/tx/${hash}`);
        return null;
      }
    } catch (error: any) {
      console.error('[Vault] Withdrawal error:', error);
      console.error('[Vault] Error details:', JSON.stringify(error, null, 2));
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        const errMsg = error.shortMessage || error.message || error.reason || 'Withdrawal failed';
        console.error('[Vault] Showing error:', errMsg);
        toast.error('Withdrawal failed: ' + errMsg);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, getVaultShares, queryClient]);

  return {
    depositUSDC,
    depositDRI,
    redeemShares,
    getVaultShares,
    getVaultStats,
    isLoading,
  };
}

