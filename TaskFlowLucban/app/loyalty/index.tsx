import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  Pressable,
} from 'react-native';
import { useLoyalty } from '../../src/hooks/useLoyalty';
import { LoyaltyCard } from '../../src/components/loyalty/LoyaltyCard';
import { RewardCard } from '../../src/components/loyalty/RewardCard';
import { TransactionItem } from '../../src/components/loyalty/TransactionItem';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { Reward, InsufficientPointsError } from '../../src/types/loyalty';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/spacing';
import { Typography } from '../../src/constants/typography';
import { formatPrice } from '../../src/utils/formatPrice';

export default function LoyaltyScreen() {
  const { balance, account, rewards, history, loading, error, redeemingId, refresh, redeem, earn } = useLoyalty();
  const [refreshing, setRefreshing] = useState(false);
  const [simulatedAmount, setSimulatedAmount] = useState('250');
  const [simulating, setSimulating] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleRedeemPress = (reward: Reward) => {
    Alert.alert(
      'Confirm Redemption',
      `Redeem "${reward.name}" for ${reward.pointsRequired} points?\n\nCurrent Balance: ${balance} pts\nNew Balance: ${balance - reward.pointsRequired} pts`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Redemption',
          style: 'default',
          onPress: () => processRedemption(reward),
        },
      ]
    );
  };

  const processRedemption = async (reward: Reward) => {
    try {
      const result = await redeem(reward);
      if (result) {
        // Generate random reward code e.g. FP-8X29K
        const codeChar = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'FP-';
        for (let i = 0; i < 5; i++) {
          code += codeChar.charAt(Math.floor(Math.random() * codeChar.length));
        }

        Alert.alert(
          'Reward Redeemed! 🎉',
          `Reward: ${result.reward.name}\n\nReward Code:\n${code}\n\nPresent this code when claiming your reward in-store.\n\nNew Balance: ${result.newBalance} points`
        );
      }
    } catch (e: any) {
      if (e instanceof InsufficientPointsError) {
        Alert.alert('Insufficient Points', e.message);
      } else {
        Alert.alert('Redemption Failed', e.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleSimulateEarn = async () => {
    const amount = parseFloat(simulatedAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid purchase amount greater than 0.');
      return;
    }

    try {
      setSimulating(true);
      const res = await earn(amount);
      if (res.pointsEarned === 0) {
        Alert.alert('No Points Earned', `A purchase of ${formatPrice(amount)} is too small to earn points. Minimum spend is ₱100.`);
      } else {
        Alert.alert(
          'Points Awarded! 🌟',
          `Earned +${res.pointsEarned} points for purchase of ${formatPrice(amount)}!\nNew balance: ${res.newBalance} pts.`
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to simulate purchase.');
    } finally {
      setSimulating(false);
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
      {/* Digital Loyalty Card */}
      <LoyaltyCard account={account} onPress={() => {}} />

      {/* Dev / Staff Test Simulator Control */}
      {__DEV__ && (
        <View style={styles.devCard}>
          <Text style={styles.devTitle}>🛠️ Simulate Purchase (Staff Test)</Text>
          <Text style={styles.devSubtitle}>
            Test earning points: ₱100 = 1 pt (e.g. ₱250 = +2 pts, ₱99 = 0 pts).
          </Text>

          <View style={styles.devInputRow}>
            <Text style={styles.currencyPrefix}>₱</Text>
            <TextInput
              style={styles.devInput}
              value={simulatedAmount}
              onChangeText={setSimulatedAmount}
              keyboardType="numeric"
              placeholder="Amount"
            />
            <Pressable
              onPress={handleSimulateEarn}
              disabled={simulating}
              style={({ pressed }) => [styles.devButton, pressed && styles.pressed]}
            >
              {simulating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.devButtonText}>Simulate</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {error && !loading ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          {/* Rewards Section */}
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
                onRedeem={handleRedeemPress}
                isRedeeming={redeemingId === reward.id}
              />
            ))
          )}

          {/* Activity / Transaction History */}
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
    marginRight: Spacing.sm,
  },
  devButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: Spacing.radiusSm,
  },
  pressed: {
    opacity: 0.8,
  },
  devButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
