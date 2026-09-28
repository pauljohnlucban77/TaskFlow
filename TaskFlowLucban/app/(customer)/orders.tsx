import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/spacing';
import { Typography } from '../../src/constants/typography';
import { formatPrice } from '../../src/utils/formatPrice';

interface OrderItem {
  id: string;
  orderNumber: string;
  productName: string;
  totalAmount: number;
  date: string;
  status: 'Completed' | 'In Progress';
}

const mockOrders: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'FP-9021',
    productName: 'Classic Apple Pie',
    totalAmount: 450,
    date: 'Sep 25, 2026',
    status: 'Completed',
  },
  {
    id: 'ord-2',
    orderNumber: 'FP-8832',
    productName: 'Wild Blueberry Pie & Cheesecake',
    totalAmount: 1130,
    date: 'Sep 20, 2026',
    status: 'Completed',
  },
  {
    id: 'ord-3',
    orderNumber: 'FP-8510',
    productName: 'Savory Chicken Pot Pie',
    totalAmount: 380,
    date: 'Sep 15, 2026',
    status: 'Completed',
  },
];

export default function OrdersScreen() {
  const router = useRouter();

  const handleRateReview = (order: OrderItem) => {
    router.push({
      pathname: '/feedback/new',
      params: {
        orderId: order.orderNumber,
        productName: order.productName,
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
                <Text style={styles.orderDate}>{item.date}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} style={{ marginRight: 4 }} />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.itemRow}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.totalAmount}>{formatPrice(item.totalAmount)}</Text>
            </View>

            <View style={styles.footerRow}>
              <Pressable
                onPress={() => handleRateReview(item)}
                style={({ pressed }) => [styles.rateButton, pressed && styles.pressed]}
                accessibilityLabel={`Rate and review order ${item.orderNumber}`}
                accessibilityRole="button"
              >
                <Ionicons name="star" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.rateButtonText}>Rate & Review Order</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
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
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  orderNumber: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  orderDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBackground,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSm,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  productName: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  totalAmount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  footerRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
  },
  rateButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
  },
  pressed: {
    opacity: 0.8,
  },
  rateButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
