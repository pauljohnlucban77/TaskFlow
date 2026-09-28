import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Promotion } from '../../types/promotion';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Badge } from '../ui/Badge';

interface PromotionCardProps {
  promotion: Promotion;
  onPress: () => void;
}

export function PromotionCard({ promotion, onPress }: PromotionCardProps) {
  const discountLabel =
    promotion.type === 'percent_off' && promotion.discountValue
      ? `${promotion.discountValue}% OFF`
      : promotion.type === 'amount_off' && promotion.discountValue
      ? `₱${promotion.discountValue} OFF`
      : promotion.type === 'bundle'
      ? 'BUNDLE'
      : 'SPECIAL';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityLabel={`Promotion: ${promotion.title}`}
      accessibilityRole="button"
    >
      {promotion.imageUrl ? (
        <Image source={{ uri: promotion.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.emoji}>🎁</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Badge label={discountLabel} variant="accent" />
          {promotion.code && <Badge label={promotion.code} variant="neutral" />}
        </View>

        <Text style={styles.title} numberOfLines={2}>{promotion.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{promotion.subtitle}</Text>

        <Text style={styles.validity}>
          Valid until {new Date(promotion.endsAt).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: 110,
    height: '100%',
    backgroundColor: Colors.surfaceVariant,
  },
  placeholder: {
    width: 110,
    height: '100%',
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  validity: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
});
