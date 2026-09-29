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
  serverTimestamp,
} from 'firebase/firestore';
import { ServiceError, runFirestore } from '../serviceError';

export const firebaseFeedbackService: FeedbackService = {
  async createFeedback(customerId: string, input: FeedbackInput, customerName = 'Valued Customer'): Promise<FeedbackItem> {
    return runFirestore(db, 'submit feedback', async (firestore) => {
      const docRef = await addDoc(collection(firestore, 'feedback'), {
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
    });
  },

  async getMyFeedback(customerId: string): Promise<FeedbackItem[]> {
    return runFirestore(db, 'load feedback', async (firestore) => {
      const q = query(collection(firestore, 'feedback'), where('customerId', '==', customerId));
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
      return list.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
    });
  },

  async getFeedbackById(id: string): Promise<FeedbackItem | null> {
    return runFirestore(db, 'load feedback details', async (firestore) => {
      const docRef = doc(firestore, 'feedback', id);
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
      return null;
    });
  },

  async updateFeedback(id: string, customerId: string, input: FeedbackInput): Promise<FeedbackItem> {
    return runFirestore(db, 'update feedback', async (firestore) => {
      const docRef = doc(firestore, 'feedback', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || docSnap.data().customerId !== customerId) {
        throw new ServiceError('feedback/not-found', 'Feedback was not found or access was denied.');
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
    });
  },

  async deleteFeedback(id: string, customerId: string): Promise<boolean> {
    return runFirestore(db, 'delete feedback', async (firestore) => {
      const docRef = doc(firestore, 'feedback', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists() || docSnap.data().customerId !== customerId) {
        throw new ServiceError('feedback/not-found', 'Feedback was not found or access was denied.');
      }

      await deleteDoc(docRef);
      return true;
    });
  },
};
