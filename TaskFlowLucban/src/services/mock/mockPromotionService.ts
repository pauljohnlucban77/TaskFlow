import { PromotionService } from '../types';
import { Promotion } from '../../types/promotion';
import { mockPromotions } from '../../data/mock/promotions';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const mockPromotionService: PromotionService = {
  async getPromotions(): Promise<Promotion[]> {
    await delay();
    return mockPromotions;
  },
  async getActivePromotions(): Promise<Promotion[]> {
    await delay();
    const now = new Date().toISOString();
    return mockPromotions.filter((p) => p.active && p.startsAt <= now && p.endsAt >= now);
  },
  async getPromotionById(id: string): Promise<Promotion | null> {
    await delay(200);
    return mockPromotions.find((p) => p.id === id) || null;
  },
};
