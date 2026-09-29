import { ProductService } from '../types';
import { Product, Category } from '../../types/product';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { mapProduct, mapCategory } from './mappers';
import { runFirestore } from '../serviceError';

export const firebaseProductService: ProductService = {
  async getProducts(): Promise<Product[]> {
    return runFirestore(db, 'load products', async (firestore) => {
      const q = query(collection(firestore, 'products'), where('published', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d: any) => mapProduct(d.id, d.data()));
    });
  },
  async getCategories(): Promise<Category[]> {
    return runFirestore(db, 'load categories', async (firestore) => {
      const snapshot = await getDocs(collection(firestore, 'categories'));
      return snapshot.docs.map((d: any) => mapCategory(d.id, d.data()));
    });
  },
  async getFeaturedProducts(): Promise<Product[]> {
    return runFirestore(db, 'load featured products', async (firestore) => {
      const q = query(collection(firestore, 'products'), where('published', '==', true), where('featured', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d: any) => mapProduct(d.id, d.data()));
    });
  },
  async getPopularProducts(): Promise<Product[]> {
    return runFirestore(db, 'load popular products', async (firestore) => {
      const q = query(collection(firestore, 'products'), where('published', '==', true), where('popular', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d: any) => mapProduct(d.id, d.data()));
    });
  },
  async getProductById(id: string): Promise<Product | null> {
    return runFirestore(db, 'load product details', async (firestore) => {
      const docRef = doc(firestore, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapProduct(docSnap.id, docSnap.data());
      }
      return null;
    });
  },
};
