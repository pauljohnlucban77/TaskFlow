import { AnnouncementService } from '../types';
import { Announcement } from '../../types/announcement';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { mapAnnouncement } from './mappers';
import { mockAnnouncementService } from '../mock/mockAnnouncementService';

export const firebaseAnnouncementService: AnnouncementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    if (!db) return mockAnnouncementService.getAnnouncements();
    try {
      const q = query(collection(db, 'announcements'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      const now = new Date().toISOString();
      const list = snapshot.docs
        .map((d: any) => mapAnnouncement(d.id, d.data()))
        .filter((a: Announcement) => !a.expiresAt || a.expiresAt >= now);
      if (list.length === 0) return mockAnnouncementService.getAnnouncements();
      return list;
    } catch (e) {
      console.warn('[Firebase] getAnnouncements error, falling back to mock:', e);
      return mockAnnouncementService.getAnnouncements();
    }
  },
  async getPinnedAnnouncement(): Promise<Announcement | null> {
    if (!db) return mockAnnouncementService.getPinnedAnnouncement();
    try {
      const all = await this.getAnnouncements();
      return all.find((a) => a.pinned) || (await mockAnnouncementService.getPinnedAnnouncement());
    } catch (e) {
      console.warn('[Firebase] getPinnedAnnouncement error, falling back to mock:', e);
      return mockAnnouncementService.getPinnedAnnouncement();
    }
  },
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    if (!db) return mockAnnouncementService.getAnnouncementById(id);
    try {
      const docRef = doc(db, 'announcements', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapAnnouncement(docSnap.id, docSnap.data());
      }
      return mockAnnouncementService.getAnnouncementById(id);
    } catch (e) {
      console.warn('[Firebase] getAnnouncementById error, falling back to mock:', e);
      return mockAnnouncementService.getAnnouncementById(id);
    }
  },
};
