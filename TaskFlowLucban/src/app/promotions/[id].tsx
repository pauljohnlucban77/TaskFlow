import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Badge } from '../../components/ui/Badge';
import { PromoCodeChip } from '../../components/promotions/PromoCodeChip';
import { ErrorState } from '../../components/ui/ErrorState';
import { promotionService } from '../../services';
import { Promotion } from '../../types/promotion';

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPromo = async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await promotionService.getPromotionById(id);
      setPromotion(item);
    } catch (e: any) {
      setError(e.message || 'Failed to load promotion details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadPromo();
  }, [id]);

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={loadPromo} />
      </View>
    );
  }

  if (!promotion) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {promotion.imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: promotion.imageUrl }} style={styles.image} contentFit="cover" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <Badge label={promotion.type.replace('_', ' ').toUpperCase()} variant="accent" />
          <Text style={styles.validity}>
            Valid until {new Date(promotion.endsAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.title}>{promotion.title}</Text>
        <Text style={styles.subtitle}>{promotion.subtitle}</Text>

        {promotion.code && <PromoCodeChip code={promotion.code} />}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          {promotion.terms.map((term, index) => (
            <View key={index} style={styles.termRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  validity: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  section: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  termRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  bullet: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  termText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
});
