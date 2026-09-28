import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductReview } from '../types/productReview';

const STORAGE_KEY = 'freds-pies.product-reviews.v1';

async function readReviews(): Promise<ProductReview[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as ProductReview[];
  } catch {
    return [];
  }
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const reviews = await readReviews();
  return reviews
    .filter((review) => review.productId === productId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

export async function saveProductReview(
  review: Omit<ProductReview, 'id' | 'createdAt'>
): Promise<ProductReview> {
  const reviews = await readReviews();
  const savedReview: ProductReview = {
    ...review,
    id: `${review.productId}-${review.customerId}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updatedReviews = reviews.filter(
    (existing) =>
      existing.productId !== review.productId || existing.customerId !== review.customerId
  );
  updatedReviews.push(savedReview);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
  return savedReview;
}