import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface PromoCodeChipProps {
  code: string;
}

export function PromoCodeChip({ code }: PromoCodeChipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Pressable
      onPress={handleCopy}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityLabel={`Copy promo code ${code}`}
      accessibilityRole="button"
    >
      <View style={styles.left}>
        <Ionicons name="pricetag-outline" size={18} color={Colors.primary} style={styles.icon} />
        <Text style={styles.codeLabel}>Promo Code:</Text>
        <Text style={styles.codeText}>{code}</Text>
      </View>
      <View style={[styles.copyBadge, copied && styles.copiedBadge]}>
        <Ionicons
          name={copied ? 'checkmark' : 'copy-outline'}
          size={14}
          color={copied ? Colors.success : Colors.primary}
        />
        <Text style={[styles.copyText, copied && styles.copiedText]}>
          {copied ? 'Copied!' : 'Copy'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  codeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  codeText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copiedBadge: {
    backgroundColor: Colors.successBackground,
    borderColor: Colors.success,
  },
  copyText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
    marginLeft: 4,
  },
  copiedText: {
    color: Colors.success,
  },
});
