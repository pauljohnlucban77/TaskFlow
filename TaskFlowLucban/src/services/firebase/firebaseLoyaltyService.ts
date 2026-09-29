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
import { ServiceError, runFirestore } from '../serviceError';

export const firebaseLoyaltyService: LoyaltyService = {
  async getOrCreateCustomer(customerId: string, email: string, name = 'Valued Customer'): Promise<LoyaltyCustomer> {
    return runFirestore(db, 'load customer loyalty profile', async (firestore) => {
      const docRef = doc(firestore, 'customers', customerId);
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
    });
  },

  async getCustomerBalance(customerId: string): Promise<number> {
    return runFirestore(db, 'load points balance', async (firestore) => {
      const docRef = doc(firestore, 'customers', customerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().points || 0;
      }
      return 0;
    });
  },

  async getActiveRewards(): Promise<Reward[]> {
    return runFirestore(db, 'load rewards', async (firestore) => {
      const q = query(collection(firestore, 'rewards'), where('active', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d: any) => mapReward(d.id, d.data()));
    });
  },

  async getTransactionHistory(customerId: string): Promise<LoyaltyTransaction[]> {
    return runFirestore(db, 'load points history', async (firestore) => {
      // Query by customerId without orderBy to avoid requiring a composite index in Firestore
      const q = query(
        collection(firestore, 'loyalty_transactions'),
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
    });
  },

  async earnPoints(customerId: string, purchaseAmount: number): Promise<{ pointsEarned: number; newBalance: number }> {
    void customerId;
    void purchaseAmount;
    throw new ServiceError(
      'loyalty/staff-grant-required',
      'Points are granted by Fred\'s Pies staff after purchase verification.'
    );
  },

  async redeemReward(customerId: string, rewardId: string): Promise<{ newBalance: number; reward: Reward }> {
    return runFirestore(db, 'redeem reward', async (firestore) => {
      const customerRef = doc(firestore, 'customers', customerId);
      const rewardRef = doc(firestore, 'rewards', rewardId);
      const txRef = doc(collection(firestore, 'loyalty_transactions'));
      let finalBalance = 0;
      let redeemedReward: Reward | null = null;

      await runTransaction(firestore, async (transaction) => {
        const rewardSnap = await transaction.get(rewardRef);
        if (!rewardSnap.exists() || !rewardSnap.data().active) {
          throw new ServiceError('loyalty/reward-unavailable', 'This reward is no longer available.');
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

        transaction.update(customerRef, {
          points: finalBalance,
          lastRedemptionId: txRef.id,
        });
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
    });
  },
};
