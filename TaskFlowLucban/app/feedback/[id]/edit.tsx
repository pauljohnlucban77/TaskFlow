import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFeedback } from '../../../src/hooks/useFeedback';
import { StarRating } from '../../../src/components/feedback/StarRating';
import { MAX_COMMENT_LENGTH } from '../../../src/utils/validateFeedback';
import { feedbackService } from '../../../src/services';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { Colors } from '../../../src/constants/colors';
import { Spacing } from '../../../src/constants/spacing';
import { Typography } from '../../../src/constants/typography';

export default function EditFeedbackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateFeedbackItem, submitting } = useFeedback();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loadingItem, setLoadingItem] = useState<boolean>(true);
  const [errorItem, setErrorItem] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadFeedbackItem = async () => {
    try {
      setLoadingItem(true);
      setErrorItem(null);
      const item = await feedbackService.getFeedbackById(id);
      if (item) {
        setRating(item.rating);
        setComment(item.comment);
      } else {
        setErrorItem('Feedback not found.');
      }
    } catch (e: any) {
      setErrorItem(e.message || 'Failed to load feedback details.');
    } finally {
      setLoadingItem(false);
    }
  };

  useEffect(() => {
    if (id) loadFeedbackItem();
  }, [id]);

  const handleUpdate = async () => {
    setValidationError(null);

    if (!rating) {
      setValidationError('Please select a star rating from 1 to 5.');
      return;
    }

    if (!comment.trim()) {
      setValidationError('Please write a brief comment sharing your experience.');
      return;
    }

    try {
      await updateFeedbackItem(id, rating, comment);
      Alert.alert(
        'Feedback Updated',
        'Your changes have been saved.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (e: any) {
      setValidationError(e.message || 'Failed to update feedback.');
    }
  };

  if (errorItem) {
    return (
      <View style={styles.container}>
        <ErrorState message={errorItem} onRetry={loadFeedbackItem} />
      </View>
    );
  }

  if (loadingItem) {
    return (
      <View style={[styles.container, styles.centerLoader]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Edit Your Feedback</Text>
        <Text style={styles.subtitle}>
          Update your star rating or review comments below.
        </Text>

        {/* Rating Picker */}
        <Text style={styles.label}>Rating</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={rating} onRatingChange={setRating} size={36} />
          <Text style={styles.ratingLabel}>{rating} of 5 Stars</Text>
        </View>

        {/* Comment Text Area */}
        <Text style={styles.label}>Your Review</Text>
        <TextInput
          style={styles.textArea}
          value={comment}
          onChangeText={setComment}
          placeholder="Tell us what you loved or how we can improve..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={5}
          maxLength={MAX_COMMENT_LENGTH}
          textAlignVertical="top"
        />

        {/* Character Count Indicator */}
        <Text style={styles.charCount}>
          {comment.length} / {MAX_COMMENT_LENGTH} characters
        </Text>

        {validationError && (
          <Text style={styles.errorText}>{validationError}</Text>
        )}

        {/* Save Changes Button */}
        <Pressable
          onPress={handleUpdate}
          disabled={submitting}
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          accessibilityLabel="Save Changes"
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  ratingRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  textArea: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    height: 130,
  },
  charCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    fontWeight: Typography.weights.semiBold,
    marginTop: Spacing.sm,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});
