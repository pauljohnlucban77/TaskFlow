import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Product } from '../../types/product';
import { ProductReview } from '../../types/productReview';
import { productService } from '../../services';
import { deleteProductReview, getProductReviews, saveProductReview } from '../../services/productReviewStore';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { uid, email, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([productService.getProductById(id), getProductReviews(id)])
      .then(([selectedProduct, productReviews]) => {
        if (!active) return;
        setProduct(selectedProduct);
        setReviews(productReviews);

        const ownReview = productReviews.find((review) => review.customerId === uid);
        if (ownReview) {
          setRating(ownReview.rating);
          setComment(ownReview.comment);
          setEditingReviewId(ownReview.id);
        } else {
          setRating(0);
          setComment('');
          setEditingReviewId(null);
        }
      })
      .catch(() => {
        if (active) setError('Could not load this product. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, uid]);

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  const customerName = user?.displayName || email?.split('@')[0] || 'Customer';

  const resetReviewForm = () => {
    setRating(0);
    setComment('');
    setEditingReviewId(null);
    setError(null);
  };

  const submitReview = async () => {
    if (!product || rating < 1 || rating > 5 || !comment.trim()) {
      setError('Select a star rating and write a review before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const savedReview = await saveProductReview({
        ...(editingReviewId ? { id: editingReviewId } : {}),
        productId: product.id,
        customerId: uid,
        customerName,
        rating,
        comment: comment.trim(),
      });

      setReviews((current) => {
        const filtered = current.filter(
          (review) => !(review.productId === product.id && review.customerId === uid)
        );
        return [savedReview, ...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      resetReviewForm();
    } catch {
      setError('Your review could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!product) return;

    Alert.alert('Delete Review?', 'Are you sure you want to delete your review? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const deleted = await deleteProductReview(product.id, uid);
            if (!deleted) {
              setError('Review could not be deleted.');
              return;
            }

            setReviews((current) => current.filter((review) => review.id !== reviewId));
            resetReviewForm();
          } catch {
            setError('Your review could not be deleted. Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{error || 'Product not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.productImage} contentFit="cover" />
      ) : (
        <View style={[styles.productImage, styles.imageFallback]}>
          <Text style={styles.fallbackIcon}>🥧</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryRating}>
            {reviews.length ? `${averageRating.toFixed(1)} / 5` : 'No ratings yet'}
          </Text>
          <Text style={styles.summaryCount}>
            {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rate and review this product</Text>
        <Text style={styles.prompt}>How would you rate this product?</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              onPress={() => setRating(value)}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${value} out of 5 stars`}
              accessibilityState={{ selected: rating === value }}
              hitSlop={6}
            >
              <Text style={[styles.star, value <= rating && styles.selectedStar]}>
                {value <= rating ? '★' : '☆'}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Write your review"
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={1000}
          textAlignVertical="top"
          style={styles.reviewInput}
        />
        <Pressable
          onPress={submitReview}
          disabled={submitting}
          accessibilityRole="button"
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, submitting && styles.disabled]}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>{editingReviewId ? 'Update Review' : 'Submit Review'}</Text>
          )}
        </Pressable>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet.</Text>
        ) : (
          reviews.map((review) => {
            const isOwnReview = review.customerId === uid;
            return (
              <View key={review.id} style={styles.review}>
                <Text accessibilityLabel={`${review.rating} out of 5 stars`} style={styles.reviewStars}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewer}>{review.customerName}</Text>

                {isOwnReview && (
                  <View style={styles.reviewActions}>
                    <Pressable
                      onPress={() => {
                        setRating(review.rating);
                        setComment(review.comment);
                        setEditingReviewId(review.id);
                        setError(null);
                      }}
                      style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                    >
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteReview(review.id)}
                      style={({ pressed }) => [styles.actionButton, styles.deleteAction, pressed && styles.actionPressed]}
                    >
                      <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  productImage: { width: '100%', height: 260, backgroundColor: Colors.surfaceVariant },
  imageFallback: { justifyContent: 'center', alignItems: 'center' },
  fallbackIcon: { fontSize: 64 },
  productInfo: { padding: Spacing.md },
  productName: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  price: { marginTop: Spacing.xs, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.primary },
  description: { marginTop: Spacing.sm, color: Colors.textSecondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  summary: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm },
  summaryRating: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.text },
  summaryCount: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  section: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: Spacing.sm },
  prompt: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  stars: { flexDirection: 'row', gap: Spacing.xs, marginVertical: Spacing.sm },
  star: { fontSize: 36, color: Colors.textMuted },
  selectedStar: { color: Colors.accent },
  reviewInput: { minHeight: 110, borderWidth: 1, borderColor: Colors.border, borderRadius: Spacing.radiusMd, padding: Spacing.md, color: Colors.text, backgroundColor: Colors.surface },
  submitButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md, backgroundColor: Colors.primary, borderRadius: Spacing.radiusMd },
  submitText: { color: Colors.white, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
  error: { marginTop: Spacing.sm, color: Colors.error, fontSize: Typography.sizes.sm },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.sizes.sm, textAlign: 'center' },
  review: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  reviewStars: { color: Colors.accent, fontSize: Typography.sizes.md },
  reviewComment: { marginTop: Spacing.xs, color: Colors.text, fontSize: Typography.sizes.md, lineHeight: 22 },
  reviewer: { marginTop: Spacing.xs, color: Colors.textSecondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold },
  reviewActions: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  actionButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Spacing.radiusSm, backgroundColor: Colors.surfaceVariant, borderWidth: 1, borderColor: Colors.border },
  actionPressed: { opacity: 0.8 },
  actionText: { color: Colors.primary, fontWeight: Typography.weights.bold },
  deleteAction: { backgroundColor: Colors.errorBackground },
  deleteActionText: { color: Colors.error },
});