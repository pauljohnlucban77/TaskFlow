import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLoyalty } from '../../hooks/useLoyalty';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { isLocalOrderPreviewEnabled } from '../../utils/localOrderPreview';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, uid, email, signIn, signUp, signOut, isMockUser, enterGuestMode } = useAuth();
  const { balance, hasPurchased } = useLoyalty();

  const [inputEmail, setInputEmail] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const localPreview = isLocalOrderPreviewEnabled();

  const handleAuthAction = async () => {
    if (!inputEmail.trim() || !inputPass.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    try {
      setSubmitting(true);
      if (isSignUpMode) {
        await signUp(inputEmail.trim(), inputPass.trim());
        Alert.alert('Account Created 🎉', 'Welcome to Fred\'s Pies! Your account has been created.');
      } else {
        await signIn(inputEmail.trim(), inputPass.trim());
        Alert.alert('Signed In', 'Welcome back to Fred\'s Pies!');
      }
      setInputEmail('');
      setInputPass('');
    } catch (e: any) {
      Alert.alert('Authentication Error', e.message || 'Failed to authenticate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Account Info Card */}
      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={Colors.white} />
        </View>
        <View style={styles.accountText}>
          <Text style={styles.accountEmail}>{email || (localPreview && !isMockUser ? 'Guest Customer' : 'Welcome to Fred’s Pies')}</Text>
          {user && <Text style={styles.accountUid}>ID: {uid.slice(0, 12)}...</Text>}
          {isMockUser && localPreview && <Text style={styles.mockBadge}>Guest account · This device</Text>}
        </View>
      </View>

      {user && !hasPurchased && (
        <View style={styles.loyaltyNotice}>
          <Text style={styles.loyaltyNoticeTitle}>No points yet</Text>
          <Text style={styles.loyaltyNoticeText}>Earn points with eligible orders placed through your account.</Text>
        </View>
      )}

      {/* Navigation Rows */}
      <View style={styles.section}>
        <Pressable
          onPress={() => router.push('/loyalty' as any)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          accessibilityLabel="Loyalty & Rewards"
          accessibilityRole="button"
        >
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBg, { backgroundColor: Colors.accentLight }]}>
              <Ionicons name="star" size={20} color={Colors.primaryDark} />
            </View>
            <View>
              <Text style={styles.rowTitle}>Loyalty & Rewards</Text>
              <Text style={styles.rowSubtitle}>{hasPurchased ? `${balance} points available` : 'Buy a product to start earning points'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/feedback' as any)}
          style={({ pressed }) => [styles.row, styles.borderTop, pressed && styles.pressed]}
          accessibilityLabel="My Feedback & Reviews"
          accessibilityRole="button"
        >
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconBg, { backgroundColor: Colors.surfaceVariant }]}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.rowTitle}>My Feedback & Reviews</Text>
              <Text style={styles.rowSubtitle}>View, edit, or share your bakery feedback</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>

      {/* Sign-In / Sign-Up Form */}
      {!user && (
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            {isSignUpMode ? 'Create Fred\'s Pies Account' : 'Sign In to Your Account'}
          </Text>
          <Text style={styles.authSubtitle}>
            {localPreview
              ? 'Sign in or create an account to use your customer profile. Orders in local preview remain saved on this device.'
              : 'Sign in to access your orders, points, and feedback.'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={inputEmail}
            onChangeText={setInputEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={inputPass}
            onChangeText={setInputPass}
            secureTextEntry
          />

          <Pressable
            onPress={handleAuthAction}
            disabled={submitting}
            style={({ pressed }) => [styles.authButton, pressed && styles.pressed]}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUpMode ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={() => setIsSignUpMode(!isSignUpMode)} style={styles.toggleAuth}>
            <Text style={styles.toggleAuthText}>
              {isSignUpMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Text>
          </Pressable>
        </View>
      )}

      {!user && localPreview && !isMockUser && (
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Your guest account is ready</Text>
          <Text style={styles.authSubtitle}>Orders and preferences are saved on this device.</Text>
          <Pressable onPress={signOut} style={styles.authButton}>
            <Text style={styles.authButtonText}>End Guest Session</Text>
          </Pressable>
        </View>
      )}

      {!user && localPreview && isMockUser && (
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Welcome to Fred’s Pies</Text>
          <Text style={styles.authSubtitle}>Explore the menu, save orders on this device, and collect them at the bakery.</Text>
          <Pressable
            onPress={() => {
              enterGuestMode();
              Alert.alert('Welcome', 'You can now place pickup orders as a guest.');
            }}
            style={styles.authButton}
          >
            <Text style={styles.authButtonText}>Continue as Guest</Text>
          </Pressable>
        </View>
      )}

      {/* Sign Out Button (if signed in) */}
      {(user || (localPreview && !isMockUser)) && (
        <Pressable
          onPress={() => signOut()}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} style={{ marginRight: 6 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  accountCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  accountText: {
    flex: 1,
  },
  accountEmail: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  accountUid: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  mockBadge: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  loyaltyNotice: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Spacing.radiusMd,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  loyaltyNoticeTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: 3,
  },
  loyaltyNoticeText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIconBg: {
    width: 38,
    height: 38,
    borderRadius: Spacing.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  authTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  authSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  authButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  authButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  toggleAuth: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  toggleAuthText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorBackground,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
  },
  signOutText: {
    color: Colors.error,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});
