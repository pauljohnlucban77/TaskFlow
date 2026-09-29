import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { mockCategories } from '../data/mock/categories';
import { mockProducts } from '../data/mock/products';
import { mockPromotions } from '../data/mock/promotions';
import { mockAnnouncements } from '../data/mock/announcements';
import { mockRewards } from '../data/mock/rewards';

export async function seedFirestoreDatabase(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return {
      success: false,
      message: 'Firestore database instance is not initialized. Check your .env config.',
    };
  }

  try {
    // Seed Categories
    for (const cat of mockCategories) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }

    // Seed Products
    for (const prod of mockProducts) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }

    // Seed Promotions
    for (const promo of mockPromotions) {
      await setDoc(doc(db, 'promotions', promo.id), promo);
    }

    // Seed Announcements
    for (const ann of mockAnnouncements) {
      await setDoc(doc(db, 'announcements', ann.id), ann);
    }

    // Seed Rewards
    for (const reward of mockRewards) {
      await setDoc(doc(db, 'rewards', reward.id), reward);
    }

    return {
      success: true,
      message: 'Firestore database successfully populated with products, categories, promotions, announcements, and rewards!',
    };
  } catch (error: any) {
    console.error('[Seed Firestore Error]:', error);
    return {
      success: false,
      message: error.message || 'Failed to seed Firestore database.',
    };
  }
}
