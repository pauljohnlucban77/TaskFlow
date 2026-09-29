import { FeedbackItem } from '../types/feedback';

export interface ProductReviewItem extends FeedbackItem {
  productId: string;
}

export const initialProductReviews: ProductReviewItem[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    customerId: 'cust-101',
    customerName: 'Sarah M.',
    rating: 5,
    comment: 'The honeycrisp apples were sweet and tart, and the crust was amazingly flaky!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    customerId: 'cust-102',
    customerName: 'David K.',
    rating: 5,
    comment: 'Best apple pie in town! Perfect cinnamon glaze ratio.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'prod-5',
    customerId: 'cust-103',
    customerName: 'Maria R.',
    rating: 5,
    comment: 'So smooth and rich! The graham cracker crust is chef\'s kiss.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
