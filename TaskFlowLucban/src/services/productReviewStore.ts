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
  review: Omit<ProductReview, 'createdAt' | 'id'> & { createdAt?: string; id?: string }
): Promise<ProductReview> {
  const reviews = await readReviews();
  const normalizedComment = review.comment.trim();
  const resolvedReview: ProductReview = {
    ...review,
    id: review.id || `${review.productId}-${review.customerId}-${Date.now()}`,
    customerName: review.customerName || 'Customer',
    comment: normalizedComment,
    createdAt: review.createdAt || new Date().toISOString(),
  };

  const updatedReviews = reviews.filter(
    (existing) =>
      !(existing.productId === review.productId && existing.customerId === review.customerId)
  );
  updatedReviews.push(resolvedReview);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
  return resolvedReview;
}

export async function deleteProductReview(productId: string, customerId: string): Promise<boolean> {
  const reviews = await readReviews();
  const remaining = reviews.filter(
    (review) => !(review.productId === productId && review.customerId === customerId)
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return remaining.length !== reviews.length;
}