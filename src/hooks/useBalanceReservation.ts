import { useCallback, useState } from 'react';
import { balanceManager, BalanceReservation } from '@/lib/balanceManager';

export function useBalanceReservation() {
  const [activeReservations, setActiveReservations] = useState<string[]>([]);

  const reserveBalance = useCallback((
    asset: string, 
    amount: number, 
    type: 'order' | 'transaction',
    orderId?: string
  ): { success: boolean; reservationId?: string; error?: string } => {
    try {
      const reservationId = balanceManager.reserveBalance(asset, amount, type, orderId);
      setActiveReservations(prev => [...prev, reservationId]);
      return { success: true, reservationId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reserve balance' 
      };
    }
  }, []);

  const releaseReservation = useCallback((reservationId: string): boolean => {
    const success = balanceManager.releaseReservation(reservationId);
    if (success) {
      setActiveReservations(prev => prev.filter(id => id !== reservationId));
    }
    return success;
  }, []);

  const releaseAllReservations = useCallback((): void => {
    activeReservations.forEach(id => {
      balanceManager.releaseReservation(id);
    });
    setActiveReservations([]);
  }, [activeReservations]);

  const getReservationsByOrder = useCallback((orderId: string): string[] => {
    return activeReservations.filter(id => {
      // This would require storing reservation details locally or querying the manager
      // For now, return empty array as this is primarily used internally
      return false;
    });
  }, [activeReservations]);

  return {
    reserveBalance,
    releaseReservation,
    releaseAllReservations,
    getReservationsByOrder,
    activeReservationsCount: activeReservations.length
  };
}