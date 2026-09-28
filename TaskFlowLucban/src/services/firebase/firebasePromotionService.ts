import { PromotionService } from '../types';
import { Promotion } from '../../types/promotion';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { mapPromotion } from './mappers';
import { mockPromotionService } from '../mock/mockPromotionService';

export const firebasePromotionService: PromotionService = {
  async getPromotions(): Promise<Promotion[]> {
    if (!db) return mockPromotionService.getPromotions();
    try {
      const snapshot = await getDocs(collection(db, 'promotions'));
      const list = snapshot.docs.map((d: any) => mapPromotion(d.id, d.data()));
      if (list.length === 0) return mockPromotionService.getPromotions();
      return list;
    } catch (e) {
      console.warn('[Firebase] getPromotions error, falling back to mock:', e);
      return mockPromotionService.getPromotions();
    }
  },
  async getActivePromotions(): Promise<Promotion[]> {
    if (!db) return mockPromotionService.getActivePromotions();
    try {
      const q = query(collection(db, 'promotions'), where('active', '==', true));
      const snapshot = await getDocs(q);
      const now = new Date().toISOString();
      const list = snapshot.docs
        .map((d: any) => mapPromotion(d.id, d.data()))
        .filter((p: Promotion) => p.startsAt <= now && p.endsAt >= now);
      if (list.length === 0) return mockPromotionService.getActivePromotions();
      return list;
    } catch (e) {
      console.warn('[Firebase] getActivePromotions error, falling back to mock:', e);
      return mockPromotionService.getActivePromotions();
    }
  },
  async getPromotionById(id: string): Promise<Promotion | null> {
    if (!db) return mockPromotionService.getPromotionById(id);
    try {
      const docRef = doc(db, 'promotions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapPromotion(docSnap.id, docSnap.data());
      }
      return mockPromotionService.getPromotionById(id);
    } catch (e) {
      console.warn('[Firebase] getPromotionById error, falling back to mock:', e);
      return mockPromotionService.getPromotionById(id);
    }
  },
};
