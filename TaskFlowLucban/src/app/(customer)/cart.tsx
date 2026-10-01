import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  TextInput,
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
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services';
import { useRouter } from 'expo-router';
import { useLoyalty } from '../../hooks/useLoyalty';
import { isLocalOrderPreviewEnabled } from '../../utils/localOrderPreview';
import { confirmAction, notify } from '../../utils/dialog';

export default function CartScreen() {
  const router = useRouter();
  const { user, uid, isMockUser, enterGuestMode } = useAuth();
  const { refresh: refreshLoyalty } = useLoyalty();
  const localPreview = isLocalOrderPreviewEnabled();
  const canPlaceOrder = Boolean(user || (localPreview && !isMockUser));
  const {
    items,
    clear,
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
  const [checkingOut, setCheckingOut] = useState(false);
  const requestRef = useRef<{ cartKey: string; requestId: string } | null>(null);
  const submitLockRef = useRef(false);

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
        notify('Promo Code', result.message);
        return;
      }

      setPromoInput(promoInput.trim().toUpperCase());
      setPromoError(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (checkingOut || submitLockRef.current) return;

    if (!canPlaceOrder) {
      if (!localPreview) {
        notify('Sign in to order', 'Sign in or create an account from your profile to place a pickup order.');
        router.push('/(customer)/profile' as any);
        return;
      }

      const orderAsGuest = await confirmAction(
        'Order as a guest?',
        'Your order is saved on this device only and guest orders do not earn loyalty points. Sign in from your profile to earn points.',
        'Place Order'
      );
      if (!orderAsGuest) return;
      enterGuestMode();
      await submitDemoOrder();
      return;
    }

    const confirmed = await confirmAction(
      'Place pickup order?',
      'Your order will be recorded for pickup. Payment is due when you collect it at the bakery.',
      'Place Order'
    );
    if (confirmed) await submitDemoOrder();
  };

  const submitDemoOrder = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    const cartKey = JSON.stringify({
      items: items
        .map((item) => ({ productId: item.product.id, quantity: item.quantity }))
        .sort((first, second) => first.productId.localeCompare(second.productId)),
      promoCode: promoCode || null,
    });
    if (!requestRef.current || requestRef.current.cartKey !== cartKey) {
      requestRef.current = {
        cartKey,
        requestId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
      };
    }

    setCheckingOut(true);
    try {
      const result = await orderService.completeDemoCheckout({
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        promoCode: promoCode || undefined,
        requestId: requestRef.current.requestId,
      }, {
        customerId: user?.uid ?? uid,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: product.price,
          lineTotal: product.price * quantity,
        })),
        subtotal,
        discount,
        total,
      });
      void refreshLoyalty();
      requestRef.current = null;
      clear();
      router.push({
        pathname: '/order-confirmation',
        params: {
          orderId: result.orderId,
          total: String(result.total),
          pointsAwarded: String(result.pointsAwarded),
          persistence: result.persistence ?? 'server',
        },
      });
    } catch (error) {
      notify('Unable to place order', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      submitLockRef.current = false;
      setCheckingOut(false);
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
                disabled={checkingOut}
                style={styles.stepButton}
                accessibilityLabel="Decrease quantity"
                accessibilityRole="button"
              >
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable
                onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                disabled={checkingOut}
                style={styles.stepButton}
                accessibilityLabel="Increase quantity"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => removeItem(item.product.id)}
              disabled={checkingOut}
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
            editable={!checkingOut}
            placeholder="Enter code"
            autoCapitalize="characters"
            style={styles.promoInput}
            placeholderTextColor={Colors.textMuted}
          />
          {appliedPromotion ? (
            <Pressable style={styles.removePromoButton} onPress={removePromoCode} disabled={checkingOut}>
              <Text style={styles.removePromoText}>Remove</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.applyPromoButton} onPress={handleApplyPromoCode} disabled={promoLoading || checkingOut}>
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

        <View style={styles.pickupInfo}>
          <Ionicons name="storefront-outline" size={20} color={Colors.primary} />
          <View style={styles.pickupTextWrap}>
            <Text style={styles.pickupTitle}>Pickup at Fred’s Pies</Text>
            <Text style={styles.pickupSubtitle}>Pay in store when you collect your order</Text>
          </View>
        </View>
        <Pressable
          onPress={() => void handleCheckout()}
          disabled={checkingOut}
          style={[styles.checkoutButton, checkingOut && styles.checkoutButtonBusy]}
          accessibilityLabel="Place pickup order"
          accessibilityRole="button"
        >
          {checkingOut ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.checkoutButtonText}>{canPlaceOrder ? 'Place Pickup Order' : localPreview ? 'Order as Guest' : 'Sign In to Order'}</Text>
          )}
        </Pressable>
        {!canPlaceOrder && (
          <Pressable
            onPress={() => router.push('/(customer)/profile' as any)}
            disabled={checkingOut}
            style={styles.signInLink}
            accessibilityRole="button"
            accessibilityLabel="Sign in to your account"
          >
            <Text style={styles.signInLinkText}>Have an account? Sign in to earn points</Text>
          </Pressable>
        )}
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
  pickupInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant, borderRadius: Spacing.radiusSm, padding: Spacing.sm, marginBottom: Spacing.md },
  pickupTextWrap: { marginLeft: Spacing.sm, flex: 1 },
  pickupTitle: { color: Colors.text, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  pickupSubtitle: { color: Colors.textSecondary, fontSize: Typography.sizes.xs, marginTop: 2 },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  signInLinkText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
  },
  checkoutButtonBusy: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
});