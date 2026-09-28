import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Announcement } from '../../types/announcement';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onPress: () => void;
  onDismiss: () => void;
}

export function AnnouncementBanner({ announcement, onPress, onDismiss }: AnnouncementBannerProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        accessibilityLabel={`Urgent notice: ${announcement.title}`}
        accessibilityRole="button"
      >
        <Ionicons name="warning" size={20} color={Colors.warning} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{announcement.title}</Text>
          <Text style={styles.message} numberOfLines={1}>{announcement.message}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </Pressable>

      <Pressable
        onPress={onDismiss}
        style={styles.dismissButton}
        accessibilityLabel="Dismiss announcement banner"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={18} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  message: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
});
