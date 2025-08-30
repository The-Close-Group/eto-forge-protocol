
import { useState, useCallback } from 'react';
import { TransactionStep, TransactionStatus } from '@/components/TransactionStatus';
import { useTradeExecution, TradeParams } from './useTradeExecution';

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
  const { executeTrade, isExecuting } = useTradeExecution();
  
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

  const executeTransaction = useCallback(async (tradeParams?: TradeParams) => {
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

      // Step 2: Execute real trade if params provided
      let txHash = generateMockTxHash();
      
      if (tradeParams) {
        const result = await executeTrade(tradeParams);
        txHash = result.transactionHash;
      } else {
        // Fallback simulation for demo
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate random failures (5% chance for real trades)
        if (Math.random() < 0.05) {
          throw new Error('Transaction failed due to slippage tolerance exceeded');
        }
      }

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
        if (tradeParams) {
          window.location.href = `/transaction-complete?txHash=${txHash}&type=swap&fromAsset=${tradeParams.fromAsset}&toAsset=${tradeParams.toAsset}&fromAmount=${tradeParams.fromAmount}&toAmount=${tradeParams.toAmount}`;
        } else {
          window.location.href = `/transaction-complete?txHash=${txHash}&type=swap&fromAsset=USDC&toAsset=MAANG&fromAmount=1000&toAmount=4.20`;
        }
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
  }, [executeTrade]);

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
