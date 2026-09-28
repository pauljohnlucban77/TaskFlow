import React from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Reward } from '../../types/loyalty';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
  isRedeeming: boolean;
}

export function RewardCard({ reward, userPoints, onRedeem, isRedeeming }: RewardCardProps) {
  const hasEnoughPoints = userPoints >= reward.pointsRequired;
  const pointsNeeded = reward.pointsRequired - userPoints;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{reward.name}</Text>
          <View style={styles.ptsBadge}>
            <Text style={styles.ptsBadgeText}>{reward.pointsRequired} pts</Text>
          </View>
        </View>

        <Text style={styles.description}>{reward.description}</Text>
      </View>

      <Pressable
        onPress={() => onRedeem(reward)}
        disabled={!hasEnoughPoints || isRedeeming}
        style={({ pressed }) => [
          styles.button,
          !hasEnoughPoints && styles.disabledButton,
          pressed && styles.pressed,
        ]}
        accessibilityLabel={`Redeem ${reward.name} for ${reward.pointsRequired} points`}
        accessibilityRole="button"
      >
        {isRedeeming ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={[styles.buttonText, !hasEnoughPoints && styles.disabledButtonText]}>
            {hasEnoughPoints ? 'Redeem' : `Need ${pointsNeeded} more pts`}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  info: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ptsBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSm,
  },
  ptsBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
  },
  disabledButtonText: {
    color: Colors.textMuted,
  },
});
