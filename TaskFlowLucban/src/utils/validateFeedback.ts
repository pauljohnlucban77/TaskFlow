import { ValidationResult } from '../types/feedback';

export const MAX_COMMENT_LENGTH = 500;

export function validateFeedback(rating: number, comment: string): ValidationResult {
  const errors: { rating?: string; comment?: string } = {};

  if (!rating || rating < 1 || rating > 5) {
    errors.rating = 'Please select a star rating from 1 to 5.';
  }

  const trimmedComment = comment ? comment.trim() : '';

  if (!trimmedComment) {
    errors.comment = 'Please write a brief comment sharing your experience.';
  } else if (trimmedComment.length > MAX_COMMENT_LENGTH) {
    errors.comment = `Comment must not exceed ${MAX_COMMENT_LENGTH} characters.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
