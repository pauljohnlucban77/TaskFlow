import { FeedbackItem } from '../../types/feedback';

const MOCK_CUSTOMER_UID = 'mock-customer-123';

export const mockFeedbackList: FeedbackItem[] = [
  {
    id: 'fb-1',
    customerId: MOCK_CUSTOMER_UID,
    customerName: 'Valued Customer',
    rating: 5,
    comment: 'The Classic Apple Pie was heavenly! Flaky crust and fresh honeycrisp apples.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-2',
    customerId: MOCK_CUSTOMER_UID,
    customerName: 'Valued Customer',
    rating: 4,
    comment: 'Great croissants and prompt pickup service. Would love to see more savory pastry options!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
