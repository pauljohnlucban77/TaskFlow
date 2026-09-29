import { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../services';
import { FeedbackItem, FeedbackInput } from '../types/feedback';
import { useCurrentCustomer } from './useCurrentCustomer';
import { validateFeedback } from '../utils/validateFeedback';

export function useFeedback() {
  const { customerId, customerName } = useCurrentCustomer();
  const activeUid = customerId;

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadMyFeedback = useCallback(async () => {
    if (!activeUid) {
      setFeedbackList([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const list = await feedbackService.getMyFeedback(activeUid);
      setFeedbackList(list || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }, [activeUid]);

  useEffect(() => {
    loadMyFeedback();
  }, [loadMyFeedback]);

  const submitFeedback = async (rating: number, comment: string) => {
    if (!activeUid) {
      throw new Error('Please sign in to submit feedback.');
    }

    const validation = validateFeedback(rating, comment);
    if (!validation.isValid) {
      const msg = Object.values(validation.errors).join(' ');
      throw new Error(msg);
    }

    try {
      setSubmitting(true);
      setError(null);
      const input: FeedbackInput = { rating, comment: comment.trim() };
      const created = await feedbackService.createFeedback(activeUid, input, customerName);
      await loadMyFeedback();
      return created;
    } catch (e: any) {
      const msg = e.message || 'Failed to submit feedback. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateFeedbackItem = async (id: string, rating: number, comment: string) => {
    if (!activeUid) {
      throw new Error('Please sign in to update feedback.');
    }

    const validation = validateFeedback(rating, comment);
    if (!validation.isValid) {
      const msg = Object.values(validation.errors).join(' ');
      throw new Error(msg);
    }

    try {
      setSubmitting(true);
      setError(null);
      const input: FeedbackInput = { rating, comment: comment.trim() };
      const updated = await feedbackService.updateFeedback(id, activeUid, input);
      await loadMyFeedback();
      return updated;
    } catch (e: any) {
      const msg = e.message || 'Failed to update feedback. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFeedbackItem = async (id: string) => {
    if (!activeUid) {
      throw new Error('Please sign in to delete feedback.');
    }

    try {
      setSubmitting(true);
      setError(null);
      await feedbackService.deleteFeedback(id, activeUid);
      await loadMyFeedback();
      return true;
    } catch (e: any) {
      const msg = e.message || 'Failed to delete feedback. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    feedbackList,
    loading,
    error,
    submitting,
    refresh: loadMyFeedback,
    submitFeedback,
    updateFeedbackItem,
    deleteFeedbackItem,
  };
}
