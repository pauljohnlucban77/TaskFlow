import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';
import { EmptyState } from '../../components/ui/EmptyState';
import { promotionService } from '../../services';
import { Promotion } from '../../types/promotion';

export default function CartScreen() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    total,
    appliedPromotion,
    promoCode,
    applyPromoCode,
    removePromoCode,
  } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    promotionService
      .getActivePromotions()
      .then((list) => {
        if (active) setPromotions(list);
      })
      .catch(() => {
        if (active) setPromotions([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleApplyPromoCode = () => {
    setPromoLoading(true);
    try {
      const result = applyPromoCode(promoInput, promotions);
      setPromoError(result.valid ? null : result.message);

      if (!result.valid) {
        Alert.alert('Promo Code', result.message);
        return;
      }

      setPromoInput(result.message.includes('Applied') ? promoCode : promoInput);
    } finally {
      setPromoLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Explore our bakery catalog and add delicious pies and pastries to your cart!"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cartItemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
            </View>

            <View style={styles.stepperContainer}>
              <Pressable
                onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                style={styles.stepButton}
                accessibilityLabel="Decrease quantity"
                accessibilityRole="button"
              >
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable
                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                style={styles.stepButton}
                accessibilityLabel="Increase quantity"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => removeItem(item.product.id)}
              style={styles.deleteButton}
              accessibilityLabel={`Remove ${item.product.name} from cart`}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </Pressable>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.promoTitle}>Promo Code</Text>
        <View style={styles.promoRow}>
          <TextInput
            value={promoInput}
            onChangeText={setPromoInput}
            placeholder="Enter code"
            autoCapitalize="characters"
            style={styles.promoInput}
            placeholderTextColor={Colors.textMuted}
          />
          {appliedPromotion ? (
            <Pressable style={styles.removePromoButton} onPress={removePromoCode}>
              <Text style={styles.removePromoText}>Remove</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.applyPromoButton} onPress={handleApplyPromoCode} disabled={promoLoading}>
              {promoLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.applyPromoText}>Apply</Text>
              )}
            </Pressable>
          )}
        </View>

        {promoError && <Text style={styles.promoError}>{promoError}</Text>}
        {appliedPromotion && (
          <Text style={styles.appliedPromotionText}>
            Applied: {appliedPromotion.title} ({promoCode})
          </Text>
        )}

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>{formatPrice(subtotal)}</Text>
        </View>

        {discount > 0 && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Discount</Text>
            <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>

        <Pressable
          disabled
          style={styles.checkoutButtonDisabled}
          accessibilityLabel="Checkout coming soon"
          accessibilityRole="button"
        >
          <Text style={styles.checkoutButtonText}>Checkout — Coming Soon</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
  },
  cartItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusSm,
    backgroundColor: Colors.surfaceVariant,
    marginRight: Spacing.md,
  },
  stepButton: {
    padding: 6,
  },
  quantityText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  footer: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  promoTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  promoInput: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  applyPromoButton: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusSm,
    minWidth: 84,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  applyPromoText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  removePromoButton: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Spacing.radiusSm,
    minWidth: 84,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removePromoText: {
    color: Colors.text,
    fontWeight: Typography.weights.bold,
  },
  promoError: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.sm,
  },
  appliedPromotionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  subtotalLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  subtotalValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  discountValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    fontWeight: Typography.weights.bold,
  },
  totalValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  checkoutButtonDisabled: {
    backgroundColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
});
