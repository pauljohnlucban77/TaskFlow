import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Product } from '../../types/product';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui/Badge';

interface FeaturedProductCardProps {
  product: Product;
  onPress?: () => void;
}

export function FeaturedProductCard({ product, onPress }: FeaturedProductCardProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const isSoldOut = !product.available || product.stockStatus === 'sold_out';
  const isLowStock = product.stockStatus === 'low_stock';

  const getStockLabel = () => {
    if (isSoldOut) return 'Sold Out';
    if (isLowStock) return 'Low Stock';
    return 'Available';
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.clickableArea, pressed && styles.pressed]}
        accessibilityLabel={`Featured ${product.name}, ${formatPrice(product.price)}, ${getStockLabel()}`}
      >
        <View style={styles.imageContainer}>
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.emoji}>🥧</Text>
            </View>
          )}
          <View style={styles.topBadges}>
            <Badge label="Featured" variant="accent" />
            <Badge
              label={getStockLabel()}
              variant={isSoldOut ? 'error' : isLowStock ? 'warning' : 'success'}
              style={styles.stockBadgeOverride}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        </View>
      </Pressable>

      <View style={styles.footer}>
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        )}

        <Pressable
          onPress={() => addItem(product)}
          disabled={isSoldOut}
          style={({ pressed }) => [
            styles.addButton,
            isSoldOut && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}
          accessibilityLabel={`Add ${product.name} to cart`}
          accessibilityRole="button"
        >
          <Text style={[styles.addButtonText, isSoldOut && styles.disabledButtonText]}>
            {isSoldOut ? 'Unavailable' : '+ Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    elevation: 3,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.08)',
  },
  clickableArea: {
    width: '100%',
  },
  pressed: {
    opacity: 0.95,
  },
  imageContainer: {
    width: '100%',
    height: 180,
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
    fontSize: 54,
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
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  price: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  pressedButton: {
    opacity: 0.8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
  },
  disabledButtonText: {
    color: Colors.textMuted,
  },
});
