import { useState, useEffect, useCallback, useMemo } from 'react';
import { loyaltyService } from '../services';
import { mockLoyaltyService } from '../services/mock/mockLoyaltyService';
import { Reward, LoyaltyTransaction, InsufficientPointsError, calculateLoyaltyAccount } from '../types/loyalty';
import { useAuth } from '../context/AuthContext';

export function useLoyalty() {
  const { uid, email } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const activeUid = uid || 'mock-customer-123';
  const activeEmail = email || 'customer@fredspies.com';
  const customerName = activeEmail ? activeEmail.split('@')[0] : 'Valued Customer';

  const account = useMemo(() => {
    return calculateLoyaltyAccount(customerName, activeEmail, activeUid, balance);
  }, [customerName, activeEmail, activeUid, balance]);

  const loadLoyaltyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const customer = await loyaltyService.getOrCreateCustomer(activeUid, activeEmail);
      setBalance(customer ? customer.points : 0);

      const [rList, hList] = await Promise.all([
        loyaltyService.getActiveRewards(),
        loyaltyService.getTransactionHistory(activeUid),
      ]);

      setRewards(rList || []);
      setHistory(hList || []);
    } catch (e: any) {
      console.warn('[useLoyalty] Error loading loyalty data, falling back to mock:', e);
      try {
        const mockCustomer = await mockLoyaltyService.getOrCreateCustomer('mock-customer-123', 'customer@fredspies.com');
        setBalance(mockCustomer.points);
        const rList = await mockLoyaltyService.getActiveRewards();
        const hList = await mockLoyaltyService.getTransactionHistory('mock-customer-123');
        setRewards(rList);
        setHistory(hList);
      } catch (err) {
        setError(e.message || 'Failed to load loyalty data.');
      }
    } finally {
      setLoading(false);
    }
  }, [activeUid, activeEmail]);

  useEffect(() => {
    loadLoyaltyData();
  }, [loadLoyaltyData]);

  const redeem = async (reward: Reward) => {
    if (redeemingId) return;
    try {
      setRedeemingId(reward.id);
      setError(null);

      const result = await loyaltyService.redeemReward(activeUid, reward.id);
      setBalance(result.newBalance);

      const newHistory = await loyaltyService.getTransactionHistory(activeUid);
      setHistory(newHistory);

      return result;
    } catch (e: any) {
      if (e instanceof InsufficientPointsError) {
        throw e;
      } else {
        const msg = e.message || 'Failed to redeem reward. Please try again.';
        setError(msg);
        throw new Error(msg);
      }
    } finally {
      setRedeemingId(null);
    }
  };

  const earn = async (purchaseAmount: number) => {
    try {
      setError(null);
      const result = await loyaltyService.earnPoints(activeUid, purchaseAmount);
      setBalance(result.newBalance);

      const newHistory = await loyaltyService.getTransactionHistory(activeUid);
      setHistory(newHistory);

      return result;
    } catch (e: any) {
      const msg = e.message || 'Failed to earn points.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    balance,
    account,
    rewards,
    history,
    loading,
    error,
    redeemingId,
    refresh: loadLoyaltyData,
    redeem,
    earn,
  };
}
