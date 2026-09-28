import { ProductService } from '../types';
import { Product, Category } from '../../types/product';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { mapProduct, mapCategory } from './mappers';
import { mockProductService } from '../mock/mockProductService';

export const firebaseProductService: ProductService = {
  async getProducts(): Promise<Product[]> {
    if (!db) return mockProductService.getProducts();
    try {
      const q = query(collection(db, 'products'), where('published', '==', true));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d: any) => mapProduct(d.id, d.data()));
      if (list.length === 0) return mockProductService.getProducts();
      return list;
    } catch (e) {
      console.warn('[Firebase] getProducts error, falling back to mock:', e);
      return mockProductService.getProducts();
    }
  },
  async getCategories(): Promise<Category[]> {
    if (!db) return mockProductService.getCategories();
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list = snapshot.docs.map((d: any) => mapCategory(d.id, d.data()));
      if (list.length === 0) return mockProductService.getCategories();
      return list;
    } catch (e) {
      console.warn('[Firebase] getCategories error, falling back to mock:', e);
      return mockProductService.getCategories();
    }
  },
  async getFeaturedProducts(): Promise<Product[]> {
    if (!db) return mockProductService.getFeaturedProducts();
    try {
      const q = query(collection(db, 'products'), where('published', '==', true), where('featured', '==', true));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d: any) => mapProduct(d.id, d.data()));
      if (list.length === 0) return mockProductService.getFeaturedProducts();
      return list;
    } catch (e) {
      console.warn('[Firebase] getFeaturedProducts error, falling back to mock:', e);
      return mockProductService.getFeaturedProducts();
    }
  },
  async getPopularProducts(): Promise<Product[]> {
    if (!db) return mockProductService.getPopularProducts();
    try {
      const q = query(collection(db, 'products'), where('published', '==', true), where('popular', '==', true));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d: any) => mapProduct(d.id, d.data()));
      if (list.length === 0) return mockProductService.getPopularProducts();
      return list;
    } catch (e) {
      console.warn('[Firebase] getPopularProducts error, falling back to mock:', e);
      return mockProductService.getPopularProducts();
    }
  },
  async getProductById(id: string): Promise<Product | null> {
    if (!db) return mockProductService.getProductById(id);
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapProduct(docSnap.id, docSnap.data());
      }
      return mockProductService.getProductById(id);
    } catch (e) {
      console.warn('[Firebase] getProductById error, falling back to mock:', e);
      return mockProductService.getProductById(id);
    }
  },
};
