import { AnnouncementService } from '../types';
import { Announcement } from '../../types/announcement';
import { mockAnnouncements } from '../../data/mock/announcements';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const mockAnnouncementService: AnnouncementService = {
  async getAnnouncements(): Promise<Announcement[]> {
    await delay();
    const now = new Date().toISOString();
    return mockAnnouncements
      .filter((a) => !a.expiresAt || a.expiresAt >= now)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },
  async getPinnedAnnouncement(): Promise<Announcement | null> {
    await delay(150);
    const now = new Date().toISOString();
    const activeList = mockAnnouncements.filter((a) => !a.expiresAt || a.expiresAt >= now);
    return activeList.find((a) => a.pinned) || null;
  },
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    await delay(200);
    return mockAnnouncements.find((a) => a.id === id) || null;
  },
};
