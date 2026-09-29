import { useState, useEffect, useCallback, useMemo } from 'react';
import { loyaltyService } from '../services';
import { getRuntimeDataSource } from '../lib/firebase';
import { Reward, LoyaltyTransaction, InsufficientPointsError, calculateLoyaltyAccount } from '../types/loyalty';
import { useAuth } from '../context/AuthContext';

export function useLoyalty() {
  const { uid, email, isMockUser, user } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  const activeUid = uid;
  const activeEmail = email;
  const demoMode = getRuntimeDataSource() === 'mock';
  const activeLoyaltyService = loyaltyService;
  const customerName = activeEmail ? activeEmail.split('@')[0] : 'Valued Customer';

  const account = useMemo(() => {
    return calculateLoyaltyAccount(customerName, activeEmail, activeUid, balance);
  }, [customerName, activeEmail, activeUid, balance]);

  const loadLoyaltyData = useCallback(async () => {
    if (!activeUid) {
      setBalance(0);
      setRewards([]);
      setHistory([]);
      setHasPurchased(false);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const customer = await activeLoyaltyService.getOrCreateCustomer(activeUid, activeEmail || 'customer@fredspies.com');
      setBalance(customer ? customer.points : 0);

      const [rList, hList] = await Promise.all([
        activeLoyaltyService.getActiveRewards(),
        activeLoyaltyService.getTransactionHistory(activeUid),
      ]);

      setRewards(rList || []);
      setHistory(hList || []);
      setHasPurchased((hList || []).some((transaction) => transaction.type === 'earned'));
    } catch (e: any) {
      console.warn('[useLoyalty] Error loading loyalty data:', e);
      setError(e.message || 'Failed to load loyalty data.');
    } finally {
      setLoading(false);
    }
  }, [activeLoyaltyService, activeUid, activeEmail, isMockUser]);

  useEffect(() => {
    loadLoyaltyData();
  }, [loadLoyaltyData]);

  const redeem = async (reward: Reward) => {
    if (!demoMode && (isMockUser || !user)) {
      throw new Error('Create an account and buy a product before redeeming rewards.');
    }
    if (!hasPurchased) {
      throw new Error('Buy a product to earn points before redeeming rewards.');
    }

    if (redeemingId) return;
    try {
      setRedeemingId(reward.id);
      setError(null);

      const result = await activeLoyaltyService.redeemReward(activeUid, reward.id);
      setBalance(result.newBalance);

      const newHistory = await activeLoyaltyService.getTransactionHistory(activeUid);
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
    if (!demoMode && (isMockUser || !user)) {
      throw new Error('Create an account and buy a product to earn points.');
    }

    try {
      setError(null);
      const result = await activeLoyaltyService.earnPoints(activeUid, purchaseAmount);
      setBalance(result.newBalance);

      const newHistory = await activeLoyaltyService.getTransactionHistory(activeUid);
      setHistory(newHistory);
      setHasPurchased((previous) => previous || result.pointsEarned > 0);

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
    hasPurchased,
    refresh: loadLoyaltyData,
    redeem,
    earn,
  };
}
