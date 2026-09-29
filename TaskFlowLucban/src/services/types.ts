import { Product, Category } from '../types/product';
import { Promotion } from '../types/promotion';
import { Announcement } from '../types/announcement';
import { LoyaltyCustomer, Reward, LoyaltyTransaction } from '../types/loyalty';
import { FeedbackItem, FeedbackInput } from '../types/feedback';
import { CustomerOrder, DemoCheckoutRequest, DemoCheckoutResult, LocalDemoCheckoutPreview } from '../types/order';

export interface ProductService {
  getProducts(): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getPopularProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
}

export interface PromotionService {
  getPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  getPromotionById(id: string): Promise<Promotion | null>;
}

export interface AnnouncementService {
  getAnnouncements(): Promise<Announcement[]>;
  getPinnedAnnouncement(): Promise<Announcement | null>;
  getAnnouncementById(id: string): Promise<Announcement | null>;
}

export interface LoyaltyService {
  getOrCreateCustomer(customerId: string, email: string, name?: string): Promise<LoyaltyCustomer>;
  getCustomerBalance(customerId: string): Promise<number>;
  getActiveRewards(): Promise<Reward[]>;
  getTransactionHistory(customerId: string): Promise<LoyaltyTransaction[]>;
  earnPoints(customerId: string, purchaseAmount: number): Promise<{ pointsEarned: number; newBalance: number }>;
  redeemReward(customerId: string, rewardId: string): Promise<{ newBalance: number; reward: Reward }>;
}

export interface OrderService {
  completeDemoCheckout(request: DemoCheckoutRequest, localPreview?: LocalDemoCheckoutPreview): Promise<DemoCheckoutResult>;
  getMyOrders(customerId: string): Promise<CustomerOrder[]>;
}

export interface FeedbackService {
  createFeedback(customerId: string, input: FeedbackInput, customerName?: string): Promise<FeedbackItem>;
  getMyFeedback(customerId: string): Promise<FeedbackItem[]>;
  getFeedbackById(id: string): Promise<FeedbackItem | null>;
  updateFeedback(id: string, customerId: string, input: FeedbackInput): Promise<FeedbackItem>;
  deleteFeedback(id: string, customerId: string): Promise<boolean>;
}
