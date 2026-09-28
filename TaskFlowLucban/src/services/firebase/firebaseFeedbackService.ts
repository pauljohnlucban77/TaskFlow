import { FeedbackService } from '../types';
import { FeedbackItem, FeedbackInput } from '../../types/feedback';
import { db } from '../../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { mockFeedbackService } from '../mock/mockFeedbackService';

export const firebaseFeedbackService: FeedbackService = {
  async createFeedback(customerId: string, input: FeedbackInput, customerName = 'Valued Customer'): Promise<FeedbackItem> {
    if (!db) return mockFeedbackService.createFeedback(customerId, input, customerName);
    try {
      const docRef = await addDoc(collection(db, 'feedback'), {
        customerId,
        customerName,
        rating: input.rating,
        comment: input.comment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const now = new Date().toISOString();
      return {
        id: docRef.id,
        customerId,
        customerName,
        rating: input.rating,
        comment: input.comment.trim(),
        createdAt: now,
        updatedAt: now,
      };
    } catch (e) {
      console.warn('[Firebase] createFeedback error, falling back to mock:', e);
      return mockFeedbackService.createFeedback(customerId, input, customerName);
    }
  },

  async getMyFeedback(customerId: string): Promise<FeedbackItem[]> {
    if (!db) return mockFeedbackService.getMyFeedback(customerId);
    try {
      const q = query(
        collection(db, 'feedback'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d: any) => {
        const data = d.data();
        return {
          id: d.id,
          customerId: data.customerId,
          customerName: data.customerName || 'Valued Customer',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          comment: data.comment || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        };
      });
      if (list.length === 0) return mockFeedbackService.getMyFeedback(customerId);
      return list;
    } catch (e) {
      console.warn('[Firebase] getMyFeedback error, falling back to mock:', e);
      return mockFeedbackService.getMyFeedback(customerId);
    }
  },

  async getFeedbackById(id: string): Promise<FeedbackItem | null> {
    if (!db) return mockFeedbackService.getFeedbackById(id);
    try {
      const docRef = doc(db, 'feedback', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          customerId: data.customerId,
          customerName: data.customerName || 'Valued Customer',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          comment: data.comment || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        };
      }
      return mockFeedbackService.getFeedbackById(id);
    } catch (e) {
      console.warn('[Firebase] getFeedbackById error, falling back to mock:', e);
      return mockFeedbackService.getFeedbackById(id);
    }
  },

  async updateFeedback(id: string, customerId: string, input: FeedbackInput): Promise<FeedbackItem> {
    if (!db) return mockFeedbackService.updateFeedback(id, customerId, input);
    try {
      const docRef = doc(db, 'feedback', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || docSnap.data().customerId !== customerId) {
        throw new Error('Feedback not found or access denied.');
      }

      await updateDoc(docRef, {
        rating: input.rating,
        comment: input.comment.trim(),
        updatedAt: serverTimestamp(),
      });

      const updatedSnap = await getDoc(docRef);
      const data = updatedSnap.data()!;
      return {
        id: updatedSnap.id,
        customerId: data.customerId,
        customerName: data.customerName,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    } catch (e) {
      console.warn('[Firebase] updateFeedback error, falling back to mock:', e);
      return mockFeedbackService.updateFeedback(id, customerId, input);
    }
  },

  async deleteFeedback(id: string, customerId: string): Promise<boolean> {
    if (!db) return mockFeedbackService.deleteFeedback(id, customerId);
    try {
      const docRef = doc(db, 'feedback', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || docSnap.data().customerId !== customerId) {
        throw new Error('Feedback not found or access denied.');
      }

      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.warn('[Firebase] deleteFeedback error, falling back to mock:', e);
      return mockFeedbackService.deleteFeedback(id, customerId);
    }
  },
};
