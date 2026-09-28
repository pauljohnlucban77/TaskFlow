import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackItem } from '../../types/feedback';
import { StarRating } from './StarRating';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface FeedbackCardProps {
  item: FeedbackItem;
  onEdit: (item: FeedbackItem) => void;
  onDelete: (item: FeedbackItem) => void;
}

export function FeedbackCard({ item, onEdit, onDelete }: FeedbackCardProps) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isEdited = item.updatedAt && item.updatedAt !== item.createdAt;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <StarRating rating={item.rating} size={20} readOnly />
        <Text style={styles.date}>{formattedDate} {isEdited ? '(edited)' : ''}</Text>
      </View>

      <Text style={styles.comment}>{item.comment}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          accessibilityLabel="Edit feedback"
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={16} color={Colors.primary} style={styles.actionIcon} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => onDelete(item)}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          accessibilityLabel="Delete feedback"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={16} color={Colors.error} style={styles.actionIcon} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  comment: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    lineHeight: 22,
    marginVertical: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginLeft: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  actionIcon: {
    marginRight: 4,
  },
  editText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
  },
  deleteText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.error,
  },
});
