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
import { isFirebaseConfigured } from '../lib/firebase';

const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE || 'mock';

const useFirebase = dataSource === 'firebase' && isFirebaseConfigured();

if (dataSource === 'firebase' && !useFirebase) {
  console.warn('[Services] EXPO_PUBLIC_DATA_SOURCE is firebase but config is invalid. Using mock data service.');
}

export const productService: ProductService = useFirebase ? firebaseProductService : mockProductService;
export const promotionService: PromotionService = useFirebase ? firebasePromotionService : mockPromotionService;
export const announcementService: AnnouncementService = useFirebase ? firebaseAnnouncementService : mockAnnouncementService;
export const loyaltyService: LoyaltyService = useFirebase ? firebaseLoyaltyService : mockLoyaltyService;
export const feedbackService: FeedbackService = useFirebase ? firebaseFeedbackService : mockFeedbackService;
