import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface StarRatingProps {
  rating: number; // 1 to 5
  onRatingChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  size = 28,
  readOnly = false,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <Pressable
            key={star}
            disabled={readOnly}
            onPress={() => onRatingChange && onRatingChange(star)}
            style={({ pressed }) => [
              styles.starTouch,
              pressed && !readOnly && styles.pressed,
            ]}
            accessibilityLabel={`${star} out of 5 stars`}
            accessibilityRole="button"
          >
            <Ionicons
              name={isFilled ? 'star' : 'star-outline'}
              size={size}
              color={isFilled ? Colors.accent : Colors.textMuted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouch: {
    padding: Spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 1.15 }],
  },
});
