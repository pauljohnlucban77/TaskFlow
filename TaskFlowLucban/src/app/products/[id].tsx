import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services';
import { Product } from '../../types/product';
import { ProductReviewItem, initialProductReviews } from '../../services/productReviewStore';
import { useCart } from '../../context/CartContext';
import { useCurrentCustomer } from '../../hooks/useCurrentCustomer';
import { StarRating } from '../../components/feedback/StarRating';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';
import { MAX_COMMENT_LENGTH, validateFeedback } from '../../utils/validateFeedback';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const { customerId, customerName } = useCurrentCustomer();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState<ProductReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await productService.getProductById(id);
      if (item) {
        setProduct(item);
      } else {
        setError('Product not found.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct();
      const matching = initialProductReviews.filter((r) => r.productId === id);
      setReviews(matching);
    }
  }, [id]);

  const isSoldOut = !product?.available || product?.stockStatus === 'sold_out';
  const isLowStock = product?.stockStatus === 'low_stock';

  const getStockLabel = () => {
    if (isSoldOut) return 'Sold Out';
    if (isLowStock) return 'Low Stock';
    return 'Available';
  };

  const myReview = reviews.find((r) => r.customerId === customerId);

  const handleStartEdit = (review: ProductReviewItem) => {
    setIsEditing(true);
    setEditingReviewId(review.id);
    setUserRating(review.rating);
    setUserComment(review.comment);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingReviewId(null);
    setUserRating(5);
    setUserComment('');
    setValidationError(null);
  };

  const handleSubmitReview = async () => {
    setValidationError(null);
    const validation = validateFeedback(userRating, userComment);
    if (!validation.isValid) {
      setValidationError(Object.values(validation.errors).join(' '));
      return;
    }

    try {
      setSubmittingReview(true);
      const now = new Date().toISOString();

      if (isEditing && editingReviewId) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReviewId
              ? { ...r, rating: userRating, comment: userComment.trim(), updatedAt: now }
              : r
          )
        );
        Alert.alert('Review Updated', 'Your product review has been updated!');
        handleCancelEdit();
      } else {
        const newReview: ProductReviewItem = {
          id: `rev-${Date.now()}`,
          productId: id,
          customerId,
          customerName,
          rating: userRating,
          comment: userComment.trim(),
          createdAt: now,
          updatedAt: now,
        };
        setReviews((prev) => [newReview, ...prev]);
        Alert.alert('Review Submitted! 🌟', 'Thank you for reviewing this product!');
        setUserRating(5);
        setUserComment('');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeletePrompt = (review: ProductReviewItem) => {
    setDeletingReview(review);
  };

  const confirmDeleteReview = () => {
    if (!deletingReview) return;
    setIsDeleting(true);
    setReviews((prev) => prev.filter((r) => r.id !== deletingReview.id));
    setIsDeleting(false);
    setDeletingReview(null);
    Alert.alert('Review Deleted', 'Your review has been deleted.');
  };

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={loadProduct} />
      </View>
    );
  }

  if (loading || !product) {
    return (
      <View style={[styles.container, styles.centerLoader]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : (product.rating ? product.rating.toFixed(1) : '5.0');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {product.image && !imageError ? (
            <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" onError={() => setImageError(true)} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.emoji}>🥧</Text>
            </View>
          )}
          <View style={styles.topBadges}>
            <Badge label={product.category.toUpperCase()} variant="accent" />
            <Badge
              label={getStockLabel()}
              variant={isSoldOut ? 'error' : isLowStock ? 'warning' : 'success'}
              style={styles.stockBadgeOverride}
            />
          </View>
        </View>

        <View style={styles.detailsContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{averageRating}</Text>
            <Text style={styles.reviewCount}>({reviews.length} customer reviews)</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <Pressable
            onPress={() => {
              addItem(product);
              Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
            }}
            disabled={isSoldOut}
            style={({ pressed }) => [
              styles.cartButton,
              isSoldOut && styles.disabledCartButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="cart" size={18} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.cartButtonText}>
              {isSoldOut ? 'Currently Unavailable' : '+ Add to Cart'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Customer Reviews & Ratings</Text>

          {(!myReview || isEditing) && (
            <View style={styles.reviewFormCard}>
              <Text style={styles.formTitle}>
                {isEditing ? 'Edit Your Review' : 'Rate & Review This Product'}
              </Text>

              <Text style={styles.label}>Your Rating</Text>
              <View style={styles.starPickerRow}>
                <StarRating rating={userRating} onRatingChange={setUserRating} size={32} />
                <Text style={styles.starPickerLabel}>{userRating} / 5 Stars</Text>
              </View>

              <Text style={styles.label}>Your Review</Text>
              <TextInput
                style={styles.textArea}
                value={userComment}
                onChangeText={setUserComment}
                placeholder="Share your thoughts on taste, crust, glaze, and quality..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={MAX_COMMENT_LENGTH}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{userComment.length} / {MAX_COMMENT_LENGTH} chars</Text>

              {validationError && <Text style={styles.errorText}>{validationError}</Text>}

              <View style={styles.formButtonRow}>
                {isEditing && (
                  <Pressable onPress={handleCancelEdit} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                  style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
                >
                  {submittingReview ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isEditing ? 'Save Changes' : 'Submit Review'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySubtitle}>Be the first customer to review this delicious pie!</Text>
            </View>
          ) : (
            reviews.map((rev) => {
              const isMine = rev.customerId === customerId;
              return (
                <View key={rev.id} style={[styles.reviewCard, isMine && styles.myReviewCard]}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewerName}>
                        {rev.customerName} {isMine ? '(You)' : ''}
                      </Text>
                      <StarRating rating={rev.rating} size={16} readOnly />
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={styles.reviewComment}>{rev.comment}</Text>

                  {isMine && !isEditing && (
                    <View style={styles.ownerActionsRow}>
                      <Pressable onPress={() => handleStartEdit(rev)} style={styles.ownerActionButton}>
                        <Ionicons name="create-outline" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.editActionText}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeletePrompt(rev)} style={styles.ownerActionButton}>
                        <Ionicons name="trash-outline" size={14} color={Colors.error} style={{ marginRight: 4 }} />
                        <Text style={styles.deleteActionText}>Delete</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={!!deletingReview}
        title="Delete Review?"
        message="Are you sure you want to delete your review for this product?"
        loading={isDeleting}
        onConfirm={confirmDeleteReview}
        onCancel={() => setDeletingReview(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.surfaceVariant,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  emoji: {
    fontSize: 64,
  },
  topBadges: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockBadgeOverride: {
    backgroundColor: Colors.surface,
  },
  detailsContent: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  price: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  star: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginRight: 6,
  },
  reviewCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  cartButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
  },
  disabledCartButton: {
    backgroundColor: Colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  cartButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  reviewsSection: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  reviewFormCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  starPickerRow: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  starPickerLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  textArea: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusSm,
    padding: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    height: 90,
  },
  charCount: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: 4,
  },
  formButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semiBold,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusSm,
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  emptyReviews: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  myReviewCard: {
    backgroundColor: Colors.surfaceVariant,
    borderColor: Colors.accent,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  reviewerName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  reviewComment: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ownerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  editActionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  deleteActionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.error,
  },
});
