import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'accent': return Colors.accentLight;
      case 'success': return Colors.successBackground;
      case 'warning': return Colors.warningBackground;
      case 'error': return Colors.errorBackground;
      case 'neutral': return Colors.surfaceVariant;
      default: return Colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'accent': return Colors.primaryDark;
      case 'success': return Colors.success;
      case 'warning': return Colors.warning;
      case 'error': return Colors.error;
      case 'neutral': return Colors.textSecondary;
      default: return Colors.white;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
    textTransform: 'uppercase',
  },
});
