import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { Category } from '../../types/product';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onPress: () => void;
}

export function CategoryCard({ category, isSelected, onPress }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.selectedCard,
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`Category ${category.name}`}
      accessibilityRole="button"
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.name, isSelected && styles.selectedName]} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  selectedName: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
});
