import { LoyaltyService } from '../types';
import { LoyaltyCustomer, Reward, LoyaltyTransaction, InsufficientPointsError } from '../../types/loyalty';
import { db } from '../../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { mapReward } from './mappers';
import { mockLoyaltyService } from '../mock/mockLoyaltyService';
import { calculatePointsEarned } from '../../utils/loyalty';

export const firebaseLoyaltyService: LoyaltyService = {
  async getOrCreateCustomer(customerId: string, email: string, name = 'Valued Customer'): Promise<LoyaltyCustomer> {
    if (!db) return mockLoyaltyService.getOrCreateCustomer(customerId, email, name);
    try {
      const docRef = doc(db, 'customers', customerId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          customerId: docSnap.id,
          name: data.name || name,
          email: data.email || email,
          points: typeof data.points === 'number' ? data.points : 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };
      } else {
        const newCustomerData = {
          name,
          email,
          points: 0,
          createdAt: serverTimestamp(),
        };
        await setDoc(docRef, newCustomerData);
        return {
          customerId,
          name,
          email,
          points: 0,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('[Firebase] getOrCreateCustomer error, falling back to mock:', e);
      return mockLoyaltyService.getOrCreateCustomer(customerId, email, name);
    }
  },

  async getCustomerBalance(customerId: string): Promise<number> {
    if (!db) return mockLoyaltyService.getCustomerBalance(customerId);
    try {
      const docRef = doc(db, 'customers', customerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().points || 0;
      }
      return 0;
    } catch (e) {
      console.warn('[Firebase] getCustomerBalance error, falling back to mock:', e);
      return mockLoyaltyService.getCustomerBalance(customerId);
    }
  },

  async getActiveRewards(): Promise<Reward[]> {
    if (!db) return mockLoyaltyService.getActiveRewards();
    try {
      const q = query(collection(db, 'rewards'), where('active', '==', true));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d: any) => mapReward(d.id, d.data()));
      if (list.length === 0) return mockLoyaltyService.getActiveRewards();
      return list;
    } catch (e) {
      console.warn('[Firebase] getActiveRewards error, falling back to mock:', e);
      return mockLoyaltyService.getActiveRewards();
    }
  },

  async getTransactionHistory(customerId: string): Promise<LoyaltyTransaction[]> {
    if (!db) return mockLoyaltyService.getTransactionHistory(customerId);
    try {
      // Query by customerId without orderBy to avoid requiring a composite index in Firestore
      const q = query(
        collection(db, 'loyalty_transactions'),
        where('customerId', '==', customerId)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d: any) => {
        const data = d.data();
        return {
          id: d.id,
          customerId: data.customerId,
          type: data.type || 'earned',
          points: data.points || 0,
          purchaseAmount: data.purchaseAmount,
          rewardId: data.rewardId,
          rewardName: data.rewardName,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };
      });
      // Sort in memory by createdAt desc
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.warn('[Firebase] getTransactionHistory error, falling back to mock:', e);
      return mockLoyaltyService.getTransactionHistory(customerId);
    }
  },

  async earnPoints(customerId: string, purchaseAmount: number): Promise<{ pointsEarned: number; newBalance: number }> {
    if (!db) return mockLoyaltyService.earnPoints(customerId, purchaseAmount);
    const pointsEarned = calculatePointsEarned(purchaseAmount);
    if (pointsEarned <= 0) {
      const current = await this.getCustomerBalance(customerId);
      return { pointsEarned: 0, newBalance: current };
    }

    try {
      const customerRef = doc(db, 'customers', customerId);
      const txRef = doc(collection(db, 'loyalty_transactions'));

      let updatedBalance = 0;

      await runTransaction(db, async (transaction) => {
        const customerSnap = await transaction.get(customerRef);
        let currentPoints = 0;
        if (customerSnap.exists()) {
          currentPoints = customerSnap.data().points || 0;
        } else {
          transaction.set(customerRef, {
            name: 'Valued Customer',
            email: '',
            points: 0,
            createdAt: serverTimestamp(),
          });
        }

        updatedBalance = currentPoints + pointsEarned;

        transaction.update(customerRef, { points: updatedBalance });
        transaction.set(txRef, {
          customerId,
          type: 'earned',
          points: pointsEarned,
          purchaseAmount,
          createdAt: serverTimestamp(),
        });
      });

      return { pointsEarned, newBalance: updatedBalance };
    } catch (e) {
      console.warn('[Firebase] earnPoints transaction failed, falling back to mock:', e);
      return mockLoyaltyService.earnPoints(customerId, purchaseAmount);
    }
  },

  async redeemReward(customerId: string, rewardId: string): Promise<{ newBalance: number; reward: Reward }> {
    if (!db) return mockLoyaltyService.redeemReward(customerId, rewardId);

    try {
      const customerRef = doc(db, 'customers', customerId);
      const rewardRef = doc(db, 'rewards', rewardId);
      const txRef = doc(collection(db, 'loyalty_transactions'));

      let finalBalance = 0;
      let redeemedReward: Reward | null = null;

      await runTransaction(db, async (transaction) => {
        const rewardSnap = await transaction.get(rewardRef);
        if (!rewardSnap.exists() || !rewardSnap.data().active) {
          throw new Error('Reward does not exist or is inactive.');
        }

        const rewardData = rewardSnap.data();
        const pointsRequired = rewardData.pointsRequired || 0;
        redeemedReward = mapReward(rewardSnap.id, rewardData);

        const customerSnap = await transaction.get(customerRef);
        if (!customerSnap.exists()) {
          throw new InsufficientPointsError(redeemedReward.name, pointsRequired, 0);
        }

        const currentPoints = customerSnap.data().points || 0;
        if (currentPoints < pointsRequired) {
          throw new InsufficientPointsError(redeemedReward.name, pointsRequired, currentPoints);
        }

        finalBalance = currentPoints - pointsRequired;

        transaction.update(customerRef, { points: finalBalance });
        transaction.set(txRef, {
          customerId,
          type: 'redeemed',
          points: pointsRequired,
          rewardId,
          rewardName: redeemedReward.name,
          createdAt: serverTimestamp(),
        });
      });

      return { newBalance: finalBalance, reward: redeemedReward! };
    } catch (e: any) {
      if (e instanceof InsufficientPointsError) {
        throw e;
      }
      console.warn('[Firebase] redeemReward transaction failed, falling back to mock:', e);
      return mockLoyaltyService.redeemReward(customerId, rewardId);
    }
  },
};
