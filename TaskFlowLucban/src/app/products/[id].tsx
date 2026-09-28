import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { getProductReviews, saveProductReview } from '../../services/productReviewStore';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { uid, email } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const submitReview = async () => {
    if (!product || rating < 1 || rating > 5 || !comment.trim()) {
      setError('Select a star rating and write a review before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const savedReview = await saveProductReview({
        productId: product.id,
        customerId: uid,
        customerName: email?.split('@')[0] || 'Customer',
        rating,
        comment: comment.trim(),
      });
      setReviews((current) => [
        savedReview,
        ...current.filter((review) => review.customerId !== uid),
      ]);
    } catch {
      setError('Your review could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
            <Text style={styles.submitText}>Submit Review</Text>
          )}
        </Pressable>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet.</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.review}>
              <Text accessibilityLabel={`${review.rating} out of 5 stars`} style={styles.reviewStars}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewer}>{review.customerName}</Text>
            </View>
          ))
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
});