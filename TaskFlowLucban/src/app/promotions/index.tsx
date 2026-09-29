import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { PromotionCard } from '../../components/promotions/PromotionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { promotionService } from '../../services';
import { Promotion } from '../../types/promotion';

export default function AllPromotionsScreen() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadPromotions = async () => {
    try {
      setError(null);
      const list = await promotionService.getActivePromotions();
      setPromotions(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load promotions');
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  return (
    <View style={styles.container}>
      {error ? (
        <ErrorState message={error} onRetry={loadPromotions} />
      ) : promotions.length === 0 ? (
        <EmptyState
          icon="gift-outline"
          title="No promotions right now"
          message="Check back soon for exciting bakery deals and specials!"
        />
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PromotionCard
              promotion={item}
              onPress={() => router.push(`/promotions/${item.id}` as any)}
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
  listContent: {
    padding: Spacing.md,
  },
});
