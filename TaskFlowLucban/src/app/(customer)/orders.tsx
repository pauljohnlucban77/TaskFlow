import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services';
import { CustomerOrder } from '../../types/order';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setOrders(await orderService.getMyOrders(user.uid));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your demo orders.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    void loadOrders();
  }, [loadOrders]));

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="person-outline" title="Sign in to view orders" message="Your pickup demo orders are saved to your account." />
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(customer)/profile' as any)}>
          <Text style={styles.primaryButtonText}>Open Profile</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadOrders()} />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <EmptyState icon="receipt-outline" title="No demo orders yet" message="Orders you place during the demo will appear here. No real payments are collected." />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={orders}
      keyExtractor={(order) => order.orderId}
      refreshing={loading}
      onRefresh={() => void loadOrders()}
      ListHeaderComponent={(
        <Text style={styles.disclaimer}>
          {orders.some((order) => order.persistence === 'device_preview')
            ? 'LOCAL PREVIEW ORDERS · SAVED ON THIS DEVICE · NO POINTS OR REAL CHARGES'
            : 'DEMO ORDERS · SIMULATED PAYMENT · NO REAL CHARGES'}
        </Text>
      )}
      renderItem={({ item: order }) => (
        <View style={styles.orderCard}>
          <View style={styles.orderHeading}>
            <View style={styles.orderTitleContainer}>
              <Text style={styles.orderTitle}>Pickup order</Text>
              <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={styles.orderStatus}>DEMO</Text>
          </View>
          <Text style={styles.orderId}>Order {order.orderId.slice(-12)}</Text>
          {order.items.map((line) => (
            <View key={line.productId} style={styles.lineRow}>
              <Text style={styles.lineName}>{line.quantity} × {line.name}</Text>
              <Text style={styles.lineTotal}>{formatPrice(line.lineTotal)}</Text>
            </View>
          ))}
          {order.discount > 0 && <Text style={styles.discount}>Promo savings: {formatPrice(order.discount)}</Text>}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total (simulated)</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>
          {order.pointsAwarded > 0 && <Text style={styles.points}>+{order.pointsAwarded} points awarded</Text>}
          <Text style={styles.orderNotice}>
            {order.persistence === 'device_preview'
              ? 'Local preview only. This order is not synced to Firebase and has not been sent to the bakery.'
              : 'This is a demo order only. It has not been sent to the bakery.'}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: Spacing.md },
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  disclaimer: { color: Colors.error, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textAlign: 'center', marginBottom: Spacing.md },
  orderCard: { backgroundColor: Colors.surface, borderRadius: Spacing.radiusMd, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  orderHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderTitleContainer: { flex: 1 },
  orderTitle: { color: Colors.text, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  orderDate: { color: Colors.textSecondary, fontSize: Typography.sizes.xs, marginTop: 2 },
  orderStatus: { color: Colors.primary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Spacing.radiusSm },
  orderId: { color: Colors.textMuted, fontSize: Typography.sizes.xs, marginVertical: Spacing.sm },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  lineName: { color: Colors.text, flex: 1, marginRight: Spacing.sm, fontSize: Typography.sizes.sm },
  lineTotal: { color: Colors.text, fontSize: Typography.sizes.sm },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: Colors.text, fontWeight: Typography.weights.bold },
  totalValue: { color: Colors.primary, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.md },
  discount: { color: Colors.success, textAlign: 'right', fontSize: Typography.sizes.xs, marginTop: 4 },
  points: { color: Colors.primary, fontWeight: Typography.weights.bold, textAlign: 'right', marginTop: Spacing.sm },
  orderNotice: { color: Colors.textMuted, fontSize: Typography.sizes.xs, marginTop: Spacing.md },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: Spacing.radiusMd, padding: Spacing.md, alignItems: 'center' },
  primaryButtonText: { color: Colors.white, fontWeight: Typography.weights.bold },
});
