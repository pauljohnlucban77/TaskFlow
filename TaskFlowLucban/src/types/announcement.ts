export type AnnouncementType = 'info' | 'new_product' | 'store_hours' | 'closure' | 'holiday' | 'service_notice';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  body?: string;
  type: AnnouncementType;
  publishedAt: string;
  expiresAt?: string;
  pinned?: boolean;
  imageUrl?: string;
  ctaLabel?: string;
  ctaRoute?: string;
}
