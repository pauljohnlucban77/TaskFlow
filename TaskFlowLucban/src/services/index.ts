import { ProductService, PromotionService, AnnouncementService, LoyaltyService, FeedbackService } from './types';
import { mockProductService } from './mock/mockProductService';
import { mockPromotionService } from './mock/mockPromotionService';
import { mockAnnouncementService } from './mock/mockAnnouncementService';
import { mockLoyaltyService } from './mock/mockLoyaltyService';
import { mockFeedbackService } from './mock/mockFeedbackService';
import { firebaseProductService } from './firebase/firebaseProductService';
import { firebasePromotionService } from './firebase/firebasePromotionService';
import { firebaseAnnouncementService } from './firebase/firebaseAnnouncementService';
import { firebaseLoyaltyService } from './firebase/firebaseLoyaltyService';
import { firebaseFeedbackService } from './firebase/firebaseFeedbackService';
import { getRuntimeDataSource, isFirebaseConfigured } from '../lib/firebase';
import { ServiceError } from './serviceError';

const dataSource = getRuntimeDataSource();
const useFirebase = dataSource === 'firebase';
const useMock = dataSource === 'mock';

console.info(`[Services] dataSource=${dataSource ?? 'unconfigured'}`);

if (useFirebase && !isFirebaseConfigured()) {
  console.warn('[Services] Firebase is configured as the data source but its environment is incomplete; service calls will fail visibly.');
}

const unconfigured = async (): Promise<never> => {
  throw new ServiceError(
    'config/data-source',
    'Set EXPO_PUBLIC_DATA_SOURCE to "mock" or "firebase" before using app services.'
  );
};

export const productService: ProductService = useFirebase
  ? firebaseProductService
  : useMock
    ? mockProductService
    : { getProducts: unconfigured, getCategories: unconfigured, getFeaturedProducts: unconfigured, getPopularProducts: unconfigured, getProductById: unconfigured };

export const promotionService: PromotionService = useFirebase
  ? firebasePromotionService
  : useMock
    ? mockPromotionService
    : { getPromotions: unconfigured, getActivePromotions: unconfigured, getPromotionById: unconfigured };

export const announcementService: AnnouncementService = useFirebase
  ? firebaseAnnouncementService
  : useMock
    ? mockAnnouncementService
    : { getAnnouncements: unconfigured, getPinnedAnnouncement: unconfigured, getAnnouncementById: unconfigured };

export const loyaltyService: LoyaltyService = useFirebase
  ? firebaseLoyaltyService
  : useMock
    ? mockLoyaltyService
    : { getOrCreateCustomer: unconfigured, getCustomerBalance: unconfigured, getActiveRewards: unconfigured, getTransactionHistory: unconfigured, earnPoints: unconfigured, redeemReward: unconfigured };

export const feedbackService: FeedbackService = useFirebase
  ? firebaseFeedbackService
  : useMock
    ? mockFeedbackService
    : { createFeedback: unconfigured, getMyFeedback: unconfigured, getFeedbackById: unconfigured, updateFeedback: unconfigured, deleteFeedback: unconfigured };
