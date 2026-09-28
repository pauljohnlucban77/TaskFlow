import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ErrorState } from '../../components/ui/ErrorState';
import { announcementService } from '../../services';
import { Announcement } from '../../types/announcement';
import { useAnnouncements } from '../../context/AnnouncementsContext';
import { formatRelativeTime } from '../../utils/dates';

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { markAsRead } = useAnnouncements();

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await announcementService.getAnnouncementById(id);
      setAnnouncement(item);
      if (item) {
        markAsRead(item.id);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load announcement details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadAnnouncement();
  }, [id]);

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={loadAnnouncement} />
      </View>
    );
  }

  if (!announcement) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {announcement.imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: announcement.imageUrl }} style={styles.image} contentFit="cover" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.time}>{formatRelativeTime(announcement.publishedAt)}</Text>
        <Text style={styles.title}>{announcement.title}</Text>

        <Text style={styles.body}>{announcement.body || announcement.message}</Text>

        {announcement.ctaLabel && announcement.ctaRoute && (
          <Pressable
            onPress={() => router.push(announcement.ctaRoute as any)}
            style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
            accessibilityLabel={announcement.ctaLabel}
            accessibilityRole="button"
          >
            <Text style={styles.ctaButtonText}>{announcement.ctaLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} style={styles.ctaIcon} />
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: Colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.lg,
  },
  time: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusMd,
  },
  pressed: {
    opacity: 0.85,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semiBold,
  },
  ctaIcon: {
    marginLeft: Spacing.sm,
  },
});
