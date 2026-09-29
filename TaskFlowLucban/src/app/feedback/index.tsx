import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Text, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '../../hooks/useFeedback';
import { FeedbackCard } from '../../components/feedback/FeedbackCard';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { FeedbackItem } from '../../types/feedback';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { getCollectionState } from '../../utils/collectionState';

export default function MyFeedbackScreen() {
  const router = useRouter();
  const { feedbackList, loading, error, refresh, deleteFeedbackItem } = useFeedback();
  const listState = getCollectionState(feedbackList, loading, error);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleEdit = (item: FeedbackItem) => {
    router.push(`/feedback/${item.id}/edit` as any);
  };

  const handleDeletePrompt = (item: FeedbackItem) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await deleteFeedbackItem(deletingItem.id);
    } catch {
      // Handled in hook
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push('/feedback/new' as any)}
        style={({ pressed }) => [styles.newButtonBanner, pressed && styles.pressed]}
        accessibilityLabel="Give New Feedback"
        accessibilityRole="button"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.newButtonText}>Give New Feedback</Text>
      </Pressable>

      {listState === 'loading' ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : listState === 'error' ? (
        <ErrorState message={error || 'Failed to load feedback.'} onRetry={refresh} />
      ) : listState === 'empty' ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No feedback shared yet"
          message="We'd love to hear about your experience! Tap above to give feedback."
        />
      ) : (
        <FlatList
          data={feedbackList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => (
            <FeedbackCard
              item={item}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />
          )}
        />
      )}

      <ConfirmDialog
        visible={!!deletingItem}
        title="Delete Feedback?"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  newButtonBanner: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Spacing.radiusMd,
  },
  pressed: {
    opacity: 0.85,
  },
  newButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
