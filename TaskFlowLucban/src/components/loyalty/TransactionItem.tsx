import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoyaltyTransaction } from '../../types/loyalty';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPrice } from '../../utils/formatPrice';

interface TransactionItemProps {
  transaction: LoyaltyTransaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isEarned = transaction.type === 'earned';

  const getTitle = () => {
    if (isEarned) {
      return transaction.purchaseAmount
        ? `Purchase of ${formatPrice(transaction.purchaseAmount)}`
        : 'Points Earned';
    }
    return transaction.rewardName || 'Reward Redeemed';
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          isEarned ? styles.earnedBg : styles.redeemedBg,
        ]}
      >
        <Ionicons
          name={isEarned ? 'arrow-down' : 'gift'}
          size={18}
          color={isEarned ? Colors.success : Colors.primary}
        />
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>{getTitle()}</Text>
        <Text style={styles.date}>
          {new Date(transaction.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      <Text style={[styles.points, isEarned ? styles.earnedText : styles.redeemedText]}>
        {isEarned ? `+${transaction.points}` : `−${transaction.points}`} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  earnedBg: {
    backgroundColor: Colors.successBackground,
  },
  redeemedBg: {
    backgroundColor: Colors.surfaceVariant,
  },
  details: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  points: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  earnedText: {
    color: Colors.success,
  },
  redeemedText: {
    color: Colors.primary,
  },
});
