import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoyaltyAccount } from '../../types/loyalty';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface LoyaltyCardProps {
  account: LoyaltyAccount;
  onPress: () => void;
}

export function LoyaltyCard({ account, onPress }: LoyaltyCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityLabel={`Loyalty Card for ${account.customerName}, ${account.points} points, ${account.tier}`}
      accessibilityRole="button"
    >
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandEmoji}>🥧</Text>
          <View>
            <Text style={styles.brandName}>FRED'S PIES</Text>
            <Text style={styles.brandSubtitle}>LOYALTY & REWARDS</Text>
          </View>
        </View>
        <View style={styles.tierBadge}>
          <Ionicons name="shield-checkmark" size={12} color={Colors.primaryDark} style={{ marginRight: 3 }} />
          <Text style={styles.tierBadgeText}>{account.tier.toUpperCase()}</Text>
        </View>
      </View>

      {/* Customer & Member ID */}
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{account.customerName}</Text>
        <Text style={styles.memberId}>Member ID: {account.memberId}</Text>
      </View>

      {/* Main Points Counter */}
      <View style={styles.pointsContainer}>
        <Text style={styles.starSymbol}>★</Text>
        <Text style={styles.pointsNumber}>{account.points.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>POINTS</Text>
      </View>

      {/* Progress Bar towards Next Tier / Reward */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressLabel}>{account.tier}</Text>
          <Text style={styles.progressRatio}>{account.points} / {account.targetPoints} pts</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${account.progressPercent}%` }]} />
        </View>
        <Text style={styles.nextRewardText}>
          {account.pointsToNextTier > 0
            ? `${account.pointsToNextTier} points to next tier level (${account.nextTier})`
            : `Top Member Tier Unlocked! (${account.tier})`}
        </Text>
      </View>

      {/* Bottom QR Code & Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qrContainer}>
          <Ionicons name="qr-code-outline" size={28} color={Colors.accentLight} />
          <Text style={styles.qrLabel}>[ SCAN IN-STORE ]</Text>
        </View>
        <View style={styles.tapPrompt}>
          <Text style={styles.tapPromptText}>Tap for Rewards & History</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.accentLight} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Spacing.radiusLg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
    elevation: 6,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandEmoji: {
    fontSize: 24,
    marginRight: Spacing.xs,
  },
  brandName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.accentLight,
    letterSpacing: 0.5,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSm,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  customerInfo: {
    marginBottom: Spacing.sm,
  },
  customerName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  memberId: {
    fontSize: Typography.sizes.xs,
    color: Colors.surfaceVariant,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: Spacing.xs,
  },
  starSymbol: {
    fontSize: 24,
    color: Colors.accent,
    marginRight: 6,
  },
  pointsNumber: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginRight: 6,
  },
  pointsLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.accentLight,
    letterSpacing: 1,
  },
  progressContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.surfaceVariant,
  },
  progressRatio: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.accentLight,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  nextRewardText: {
    fontSize: 11,
    color: Colors.surfaceVariant,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: Spacing.sm,
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.surfaceVariant,
    marginLeft: 6,
  },
  tapPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tapPromptText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.accentLight,
    marginRight: 4,
  },
});
