import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Announcement } from '../../types/announcement';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatRelativeTime } from '../../utils/dates';

interface AnnouncementCardProps {
  announcement: Announcement;
  isUnread: boolean;
  onPress: () => void;
}

export function AnnouncementCard({ announcement, isUnread, onPress }: AnnouncementCardProps) {
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (announcement.type) {
      case 'closure': return 'warning-outline';
      case 'new_product': return 'sparkles-outline';
      case 'store_hours': return 'time-outline';
      case 'holiday': return 'gift-outline';
      case 'service_notice': return 'information-circle-outline';
      default: return 'megaphone-outline';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isUnread && styles.unreadCard,
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`Announcement: ${announcement.title}`}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIconName()} size={22} color={Colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
            {announcement.title}
          </Text>
          {isUnread && <View style={styles.dot} />}
        </View>

        <Text style={styles.message} numberOfLines={2}>{announcement.message}</Text>

        <Text style={styles.time}>{formatRelativeTime(announcement.publishedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
  },
  unreadCard: {
    backgroundColor: Colors.surfaceVariant,
    borderColor: Colors.accent,
  },
  pressed: {
    opacity: 0.9,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  message: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
});
