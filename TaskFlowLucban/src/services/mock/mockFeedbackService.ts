import { FeedbackService } from '../types';
import { FeedbackItem, FeedbackInput } from '../../types/feedback';
import { mockFeedbackList } from '../../data/mock/feedback';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const inMemoryFeedback: FeedbackItem[] = [...mockFeedbackList];

export const mockFeedbackService: FeedbackService = {
  async createFeedback(customerId: string, input: FeedbackInput, customerName = 'Valued Customer'): Promise<FeedbackItem> {
    await delay(300);
    const now = new Date().toISOString();
    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      customerId,
      customerName,
      rating: input.rating,
      comment: input.comment.trim(),
      createdAt: now,
      updatedAt: now,
    };
    inMemoryFeedback.unshift(newItem);
    return newItem;
  },

  async getMyFeedback(customerId: string): Promise<FeedbackItem[]> {
    await delay(200);
    return inMemoryFeedback
      .filter((item) => item.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getFeedbackById(id: string): Promise<FeedbackItem | null> {
    await delay(150);
    return inMemoryFeedback.find((item) => item.id === id) || null;
  },

  async updateFeedback(id: string, customerId: string, input: FeedbackInput): Promise<FeedbackItem> {
    await delay(300);
    const index = inMemoryFeedback.findIndex((item) => item.id === id && item.customerId === customerId);
    if (index === -1) {
      throw new Error('Feedback not found or access denied.');
    }
    const updated: FeedbackItem = {
      ...inMemoryFeedback[index],
      rating: input.rating,
      comment: input.comment.trim(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryFeedback[index] = updated;
    return updated;
  },

  async deleteFeedback(id: string, customerId: string): Promise<boolean> {
    await delay(250);
    const index = inMemoryFeedback.findIndex((item) => item.id === id && item.customerId === customerId);
    if (index === -1) {
      throw new Error('Feedback not found or access denied.');
    }
    inMemoryFeedback.splice(index, 1);
    return true;
  },
};
