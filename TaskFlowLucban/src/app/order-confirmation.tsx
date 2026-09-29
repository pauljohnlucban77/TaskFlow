import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { formatPrice } from '../utils/formatPrice';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; total?: string; pointsAwarded?: string; persistence?: string }>();
  const total = Number(params.total ?? 0);
  const points = Number(params.pointsAwarded ?? 0);
  const isDevicePreview = params.persistence === 'device_preview';

  return (
    <View style={styles.container}>
      <View style={styles.confirmationCard}>
        <View style={styles.iconCircle}><Ionicons name="checkmark" size={42} color={Colors.white} /></View>
        <Text style={styles.title}>Demo order placed</Text>
        <Text style={styles.subtitle}>
          {isDevicePreview
            ? 'Your simulated pickup order was saved on this device for preview.'
            : 'Your simulated pickup order was recorded in the staging demo.'}
        </Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{isDevicePreview ? 'Local preview only · no points awarded' : 'No payment was collected'}</Text>
          <Text style={styles.noticeBody}>
            {isDevicePreview
              ? 'This preview is saved only in this app on this device. It is not synced to Firebase, earns no points, and has not been sent to the bakery.'
              : 'This order is for demonstration only and has not been sent to the bakery.'}
          </Text>
        </View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Order reference</Text><Text style={styles.summaryValue}>{params.orderId?.slice(-12) || '—'}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Simulated total</Text><Text style={styles.summaryValue}>{formatPrice(Number.isFinite(total) ? total : 0)}</Text></View>
        {points > 0 && <View style={styles.pointsRow}><Text style={styles.pointsValue}>+{points} loyalty points awarded</Text></View>}
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(customer)/orders')}>
          <Text style={styles.primaryButtonText}>View Demo Orders</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(customer)/products')}>
          <Text style={styles.secondaryButtonText}>Continue Browsing</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: Spacing.md },
  confirmationCard: { backgroundColor: Colors.surface, borderRadius: Spacing.radiusLg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  iconCircle: { height: 76, width: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, marginBottom: Spacing.md },
  title: { color: Colors.text, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sizes.sm, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.md },
  notice: { backgroundColor: Colors.surfaceVariant, borderRadius: Spacing.radiusSm, padding: Spacing.md, width: '100%', marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  noticeTitle: { color: Colors.text, fontWeight: Typography.weights.bold, marginBottom: 3 },
  noticeBody: { color: Colors.textSecondary, fontSize: Typography.sizes.xs, lineHeight: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: Spacing.xs },
  summaryLabel: { color: Colors.textSecondary, fontSize: Typography.sizes.sm },
  summaryValue: { color: Colors.text, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semiBold },
  pointsRow: { width: '100%', borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  pointsValue: { color: Colors.primary, fontWeight: Typography.weights.bold, textAlign: 'center' },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: Spacing.radiusMd, padding: Spacing.md, width: '100%', alignItems: 'center', marginTop: Spacing.lg },
  primaryButtonText: { color: Colors.white, fontWeight: Typography.weights.bold },
  secondaryButton: { padding: Spacing.md },
  secondaryButtonText: { color: Colors.primary, fontWeight: Typography.weights.semiBold },
});
