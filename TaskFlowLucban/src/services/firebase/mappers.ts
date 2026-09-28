import { Product, Category } from '../../types/product';
import { Promotion } from '../../types/promotion';
import { Announcement } from '../../types/announcement';
import { Reward } from '../../types/loyalty';

export function mapProduct(docId: string, data: any): Product {
  return {
    id: docId,
    name: data.name || '',
    description: data.description || '',
    price: typeof data.price === 'number' ? data.price : 0,
    category: data.category || 'pies',
    image: data.image,
    available: !!data.available,
    stockStatus: data.stockStatus || 'available',
    rating: data.rating,
    featured: !!data.featured,
    popular: !!data.popular,
    published: data.published ?? true,
  };
}

export function mapCategory(docId: string, data: any): Category {
  return {
    id: docId,
    name: data.name || '',
    icon: data.icon || '🍞',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 1,
  };
}

export function mapPromotion(docId: string, data: any): Promotion {
  return {
    id: docId,
    title: data.title || '',
    subtitle: data.subtitle || '',
    type: data.type || 'percent_off',
    code: data.code,
    discountValue: data.discountValue,
    minSpend: data.minSpend,
    applicableCategoryIds: data.applicableCategoryIds,
    applicableProductIds: data.applicableProductIds,
    startsAt: data.startsAt?.toDate ? data.startsAt.toDate().toISOString() : (data.startsAt || new Date().toISOString()),
    endsAt: data.endsAt?.toDate ? data.endsAt.toDate().toISOString() : (data.endsAt || new Date().toISOString()),
    imageUrl: data.imageUrl,
    backgroundColor: data.backgroundColor,
    terms: Array.isArray(data.terms) ? data.terms : [],
    active: !!data.active,
  };
}

export function mapAnnouncement(docId: string, data: any): Announcement {
  return {
    id: docId,
    title: data.title || '',
    message: data.message || '',
    body: data.body,
    type: data.type || 'info',
    publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : (data.publishedAt || new Date().toISOString()),
    expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt,
    pinned: !!data.pinned,
    imageUrl: data.imageUrl,
    ctaLabel: data.ctaLabel,
    ctaRoute: data.ctaRoute,
  };
}

export function mapReward(docId: string, data: any): Reward {
  return {
    id: docId,
    name: data.name || '',
    description: data.description || '',
    pointsRequired: typeof data.pointsRequired === 'number' ? data.pointsRequired : 0,
    active: !!data.active,
  };
}
