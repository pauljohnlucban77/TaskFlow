export interface FeedbackItem {
  id: string;
  customerId: string;
  customerName?: string;
  rating: number; // Whole number 1 to 5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackInput {
  rating: number;
  comment: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    rating?: string;
    comment?: string;
  };
}
