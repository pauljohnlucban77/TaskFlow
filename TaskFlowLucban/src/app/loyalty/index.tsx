import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLoyalty } from '../../hooks/useLoyalty';
import { useAuth } from '../../context/AuthContext';
import { LoyaltyCard } from '../../components/loyalty/LoyaltyCard';
import { RewardCard } from '../../components/loyalty/RewardCard';
import { TransactionItem } from '../../components/loyalty/TransactionItem';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Reward, InsufficientPointsError } from '../../types/loyalty';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

export default function LoyaltyScreen() {
  const { user } = useAuth();
  const { balance, account, rewards, history, loading, error, redeemingId, hasPurchased, refresh, redeem } = useLoyalty();
  const canUseRewards = Boolean(user && hasPurchased);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [redemptionMessage, setRedemptionMessage] = useState<{
    title: string;
    message: string;
    isError: boolean;
  } | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleRedeemPress = (reward: Reward) => {
    setRedemptionMessage(null);
    setPendingReward(reward);
  };

  const processRedemption = async (reward: Reward) => {
    try {
      const result = await redeem(reward);
      if (result) {
        const codeChar = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'FP-';
        for (let i = 0; i < 5; i++) {
          code += codeChar.charAt(Math.floor(Math.random() * codeChar.length));
        }

        setPendingReward(null);
        setRedemptionMessage({
          title: 'Reward Redeemed!',
          message: `Reward: ${result.reward.name}\n\nReward Code: ${code}\n\nPresent this code when claiming your reward in-store.\n\nNew Balance: ${result.newBalance} points`,
          isError: false,
        });
      }
    } catch (e: any) {
      setPendingReward(null);
      if (e instanceof InsufficientPointsError) {
        setRedemptionMessage({ title: 'Insufficient Points', message: e.message, isError: true });
      } else {
        setRedemptionMessage({
          title: 'Redemption Failed',
          message: e.message || 'Something went wrong. Please try again.',
          isError: true,
        });
      }
    }
  };


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <LoyaltyCard account={account} onPress={() => {}} />

      {pendingReward && (
        <View style={styles.redemptionPanel}>
          <Text style={styles.redemptionTitle}>Confirm Redemption</Text>
          <Text style={styles.redemptionText}>
            Redeem {pendingReward.name} for {pendingReward.pointsRequired} points? Current balance: {balance} points.
          </Text>
          <View style={styles.redemptionActions}>
            <Pressable
              onPress={() => setPendingReward(null)}
              disabled={redeemingId === pendingReward.id}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void processRedemption(pendingReward)}
              disabled={!canUseRewards || redeemingId === pendingReward.id}
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              {redeemingId === pendingReward.id ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Redemption</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {redemptionMessage && (
        <View
          style={[styles.redemptionPanel, redemptionMessage.isError && styles.redemptionError]}
          accessibilityRole="alert"
        >
          <Text style={styles.redemptionTitle}>{redemptionMessage.title}</Text>
          <Text style={styles.redemptionText}>{redemptionMessage.message}</Text>
          <Pressable
            onPress={() => setRedemptionMessage(null)}
            style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
          >
            <Text style={styles.confirmButtonText}>Done</Text>
          </Pressable>
        </View>
      )}

      {error && !loading ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          <SectionHeader
            title="Available Rewards"
            subtitle="Redeem your earned points for delicious bakery treats"
          />

          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loaderText}>Loading rewards...</Text>
            </View>
          ) : rewards.length === 0 ? (
            <EmptyState
              icon="gift-outline"
              title="No rewards available right now"
              message="Check back soon for new rewards!"
            />
          ) : (
            rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={balance}
                onRedeem={canUseRewards ? handleRedeemPress : () => {}}
                isRedeeming={redeemingId === reward.id}
              />
            ))
          )}

          <SectionHeader
            title="Points History"
            subtitle="Your earning and redemption activity"
          />

          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : history.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="No activity yet"
              message="Your points history will show up here after your first purchase or reward redemption."
            />
          ) : (
            history.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  loaderContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
  devCard: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  devTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  devSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  devInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  currencyPrefix: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginRight: 4,
  },
  devInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusSm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  devButton: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Spacing.radiusSm,
  },
  devButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  redemptionPanel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  redemptionError: {
    borderColor: Colors.error,
  },
  redemptionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  redemptionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  redemptionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
  },
  confirmButton: {
    minHeight: 40,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusSm,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
