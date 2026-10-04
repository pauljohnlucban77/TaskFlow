import React, { useState } from 'react';
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
import { useFeedback } from '../../hooks/useFeedback';
import { StarRating } from '../../components/feedback/StarRating';
import { MAX_COMMENT_LENGTH } from '../../utils/validateFeedback';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

export default function GiveFeedbackScreen() {
  const router = useRouter();
  const { orderId, productName } = useLocalSearchParams<{ orderId?: string; productName?: string }>();
  const { submitFeedback, submitting } = useFeedback();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
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
      const fullComment = productName
        ? `[Product: ${productName}${orderId ? ` | Order #${orderId}` : ''}] ${comment.trim()}`
        : comment.trim();

      await submitFeedback(rating, fullComment);
      setRating(0);
      setComment('');
      setValidationError(null);
      Alert.alert(
        'Review Posted!',
        'Your feedback has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (e: any) {
      setValidationError(e.message || 'Failed to submit feedback.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>How was your experience?</Text>
        <Text style={styles.subtitle}>
          {productName
            ? `Reviewing: ${productName}${orderId ? ` (Order #${orderId})` : ''}`
            : 'Your feedback helps Master Baker Fred improve our pies and bakery service.'}
        </Text>

        <Text style={styles.label}>Rating</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={rating} onRatingChange={setRating} size={36} />
          <Text style={styles.ratingLabel}>{rating} of 5 Stars</Text>
        </View>

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

        <Text style={styles.charCount}>
          {comment.length} / {MAX_COMMENT_LENGTH} characters
        </Text>

        {validationError && (
          <Text style={styles.errorText}>{validationError}</Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          accessibilityLabel="Submit Feedback"
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
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
