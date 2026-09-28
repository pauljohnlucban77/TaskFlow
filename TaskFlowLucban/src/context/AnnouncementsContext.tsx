import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Announcement } from '../types/announcement';
import { announcementService } from '../services';

interface AnnouncementsContextType {
  announcements: Announcement[];
  pinnedAnnouncement: Announcement | null;
  unreadIds: Set<string>;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  urgentDismissed: boolean;
  dismissUrgent: () => void;
  refresh: () => Promise<void>;
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);

export function AnnouncementsProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<Announcement | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [urgentDismissed, setUrgentDismissed] = useState<boolean>(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, pinned] = await Promise.all([
        announcementService.getAnnouncements(),
        announcementService.getPinnedAnnouncement(),
      ]);
      setAnnouncements(list);
      setPinnedAnnouncement(pinned);
    } catch (e: any) {
      setError(e.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const unreadIds = useMemo(() => {
    const set = new Set<string>();
    announcements.forEach((a) => {
      if (!readIds.has(a.id)) {
        set.add(a.id);
      }
    });
    return set;
  }, [announcements, readIds]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const markAllAsRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      announcements.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const dismissUrgent = () => {
    setUrgentDismissed(true);
  };

  return (
    <AnnouncementsContext.Provider
      value={{
        announcements,
        pinnedAnnouncement,
        unreadIds,
        unreadCount: unreadIds.size,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        urgentDismissed,
        dismissUrgent,
        refresh: fetchAnnouncements,
      }}
    >
      {children}
    </AnnouncementsContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementsContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
  }
  return context;
}
