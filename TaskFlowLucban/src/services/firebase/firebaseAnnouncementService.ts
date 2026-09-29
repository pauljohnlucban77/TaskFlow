import { AnnouncementService } from '../types';
import { Announcement } from '../../types/announcement';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { mapAnnouncement } from './mappers';
import { runFirestore } from '../serviceError';

export const firebaseAnnouncementService: AnnouncementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    return runFirestore(db, 'load announcements', async (firestore) => {
      const q = query(collection(firestore, 'announcements'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      const now = new Date().toISOString();
      return snapshot.docs
        .map((d: any) => mapAnnouncement(d.id, d.data()))
        .filter((a: Announcement) => !a.expiresAt || a.expiresAt >= now);
    });
  },
  async getPinnedAnnouncement(): Promise<Announcement | null> {
    return runFirestore(db, 'load pinned announcement', async () => {
      const all = await this.getAnnouncements();
      return all.find((a) => a.pinned) || null;
    });
  },
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return runFirestore(db, 'load announcement details', async (firestore) => {
      const docRef = doc(firestore, 'announcements', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapAnnouncement(docSnap.id, docSnap.data());
      }
      return null;
    });
  },
};
