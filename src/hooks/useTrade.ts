
import { useState, useCallback } from 'react';
import { TransactionStep, TransactionStatus } from '@/components/TransactionStatus';

interface TradeState {
  isConfirmationOpen: boolean;
  isTransactionOpen: boolean;
  transactionStatus: TransactionStatus;
  currentStep: TransactionStep;
  transactionHash?: string;
  error?: string;
}

const generateMockTxHash = () => 
  '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

export function useTrade() {
  const [state, setState] = useState<TradeState>({
    isConfirmationOpen: false,
    isTransactionOpen: false,
    transactionStatus: 'pending',
    currentStep: 'approve'
  });

  const openConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isConfirmationOpen: true }));
  }, []);

  const closeConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isConfirmationOpen: false }));
  }, []);

  const executeTransaction = useCallback(async () => {
    // Close confirmation and open transaction status
    setState(prev => ({
      ...prev,
      isConfirmationOpen: false,
      isTransactionOpen: true,
      transactionStatus: 'pending',
      currentStep: 'approve',
      transactionHash: undefined,
      error: undefined
    }));

    try {
      // Step 1: Approve tokens
      await new Promise(resolve => setTimeout(resolve, 2000));
      setState(prev => ({ ...prev, currentStep: 'swap' }));

      // Step 2: Execute swap
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random failures (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Transaction failed due to slippage tolerance exceeded');
      }

      const txHash = generateMockTxHash();
      setState(prev => ({ 
        ...prev, 
        currentStep: 'confirm',
        transactionHash: txHash
      }));

      // Step 3: Confirm transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setState(prev => ({ 
        ...prev, 
        transactionStatus: 'success'
      }));

      // Navigate to transaction complete page after a brief delay
      setTimeout(() => {
        window.location.href = `/transaction-complete?txHash=${txHash}&type=swap&fromAsset=USDC&toAsset=MAANG&fromAmount=1000&toAmount=4.20`;
      }, 2000);

    } catch (error: any) {
      console.error('Transaction failed:', error);
      setState(prev => ({
        ...prev,
        transactionStatus: 'error',
        error: error.message,
        transactionHash: generateMockTxHash() // Even failed transactions have hashes
      }));
    }
  }, []);

  const closeTransaction = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isTransactionOpen: false,
      transactionStatus: 'pending',
      currentStep: 'approve',
      transactionHash: undefined,
      error: undefined
    }));
  }, []);

  return {
    ...state,
    openConfirmation,
    closeConfirmation,
    executeTransaction,
    closeTransaction
  };
}
