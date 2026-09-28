import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { AnnouncementCard } from '../../components/announcements/AnnouncementCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAnnouncements } from '../../context/AnnouncementsContext';

export default function AnnouncementsFeedScreen() {
  const router = useRouter();
  const { announcements, unreadIds, markAllAsRead, refresh, error, loading } = useAnnouncements();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <View style={styles.container}>
      {unreadIds.size > 0 && (
        <View style={styles.headerActionRow}>
          <Text style={styles.unreadCountText}>{unreadIds.size} unread announcements</Text>
          <Pressable
            onPress={markAllAsRead}
            style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}
            accessibilityLabel="Mark all as read"
            accessibilityRole="button"
          >
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        </View>
      )}

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="You're all caught up"
          message="No announcements right now. Check back later for bakery updates!"
        />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AnnouncementCard
              announcement={item}
              isUnread={unreadIds.has(item.id)}
              onPress={() => router.push(`/announcements/${item.id}` as any)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadCountText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
  },
  markAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  markAllText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
    color: Colors.primary,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
