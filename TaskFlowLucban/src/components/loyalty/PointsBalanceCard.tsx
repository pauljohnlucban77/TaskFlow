import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface PointsBalanceCardProps {
  points: number;
}

export function PointsBalanceCard({ points }: PointsBalanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeContainer}>
          <Ionicons name="star" size={16} color={Colors.accent} />
          <Text style={styles.badgeText}>Fred's Club Member</Text>
        </View>
        <Ionicons name="trophy-outline" size={28} color={Colors.accent} />
      </View>

      <Text style={styles.label}>Your Balance</Text>
      <Text style={styles.points}>{points} <Text style={styles.ptsUnit}>pts</Text></Text>

      <View style={styles.hintContainer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.accentLight} style={styles.hintIcon} />
        <Text style={styles.hintText}>Earn 1 point for every ₱100 spent on bakery orders.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    elevation: 4,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSm,
  },
  badgeText: {
    color: Colors.accentLight,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginLeft: 4,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.surfaceVariant,
    marginTop: Spacing.xs,
  },
  points: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginVertical: 4,
  },
  ptsUnit: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.medium,
    color: Colors.accentLight,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  hintIcon: {
    marginRight: Spacing.xs,
  },
  hintText: {
    fontSize: Typography.sizes.xs,
    color: Colors.surfaceVariant,
    flex: 1,
  },
});
