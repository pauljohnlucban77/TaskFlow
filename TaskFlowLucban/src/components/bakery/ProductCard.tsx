import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Product } from '../../types/product';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { categoryEmoji } from '../../utils/categoryEmoji';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const isSoldOut = !product.available || product.stockStatus === 'sold_out';
  const isLowStock = product.stockStatus === 'low_stock';

  const getStockLabel = () => {
    if (isSoldOut) return 'Sold Out';
    if (isLowStock) return 'Low Stock';
    return 'Available';
  };

  const getStockVariantStyle = () => {
    if (isSoldOut) return { color: Colors.error };
    if (isLowStock) return { color: Colors.warning };
    return { color: Colors.success };
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.clickableArea, pressed && styles.pressed]}
        accessibilityLabel={`${product.name}, ${formatPrice(product.price)}, ${getStockLabel()}`}
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
              <Text style={styles.emoji}>{categoryEmoji(product.category)}</Text>
            </View>
          )}
          <View style={styles.stockBadge}>
            <Text style={[styles.stockText, getStockVariantStyle()]}>{getStockLabel()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        </View>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
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
            {isSoldOut ? 'Unavailable' : '+ Add'}
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
    width: 170,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  clickableArea: {
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
  },
  imageContainer: {
    width: '100%',
    height: 120,
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
    fontSize: 36,
  },
  stockBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stockText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  content: {
    padding: Spacing.sm,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    height: 32,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    paddingTop: 0,
  },
  price: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Spacing.radiusSm,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  pressedButton: {
    opacity: 0.7,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
  },
  disabledButtonText: {
    color: Colors.textMuted,
  },
});