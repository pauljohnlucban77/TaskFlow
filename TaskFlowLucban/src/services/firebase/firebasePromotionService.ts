import { PromotionService } from '../types';
import { Promotion } from '../../types/promotion';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { mapPromotion } from './mappers';
import { runFirestore } from '../serviceError';

export const firebasePromotionService: PromotionService = {
  async getPromotions(): Promise<Promotion[]> {
    return runFirestore(db, 'load promotions', async (firestore) => {
      const snapshot = await getDocs(collection(firestore, 'promotions'));
      return snapshot.docs.map((d: any) => mapPromotion(d.id, d.data()));
    });
  },
  async getActivePromotions(): Promise<Promotion[]> {
    return runFirestore(db, 'load active promotions', async (firestore) => {
      const q = query(collection(firestore, 'promotions'), where('active', '==', true));
      const snapshot = await getDocs(q);
      const now = new Date().toISOString();
      return snapshot.docs
        .map((d: any) => mapPromotion(d.id, d.data()))
        .filter((p: Promotion) => p.startsAt <= now && p.endsAt >= now);
    });
  },
  async getPromotionById(id: string): Promise<Promotion | null> {
    return runFirestore(db, 'load promotion details', async (firestore) => {
      const docRef = doc(firestore, 'promotions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapPromotion(docSnap.id, docSnap.data());
      }
      return null;
    });
  },
};
