import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Promotion } from '../../types/promotion';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Badge } from '../ui/Badge';

interface PromotionCarouselProps {
  promotions: Promotion[];
  onSelectPromotion: (id: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.lg * 2;

export function PromotionCarousel({ promotions, onSelectPromotion }: PromotionCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % promotions.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (!promotions.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={promotions}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + Spacing.md,
          offset: (CARD_WIDTH + Spacing.md) * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          flatListRef.current?.scrollToOffset({
            offset: (CARD_WIDTH + Spacing.md) * index,
            animated: true,
          });
        }}
        snapToInterval={CARD_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContainer}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + Spacing.md));
          setActiveIndex(index);
        }}
        renderItem={({ item }) => {
          const discountLabel =
            item.type === 'percent_off' && item.discountValue
              ? `${item.discountValue}% OFF`
              : item.type === 'amount_off' && item.discountValue
              ? `₱${item.discountValue} OFF`
              : item.type === 'bundle'
              ? 'BUNDLE DEAL'
              : 'SPECIAL';

          return (
            <Pressable
              onPress={() => onSelectPromotion(item.id)}
              style={({ pressed }) => [styles.bannerCard, pressed && styles.pressed]}
              accessibilityLabel={`Promotion: ${item.title}`}
              accessibilityRole="button"
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} contentFit="cover" />
              ) : (
                <View style={[styles.fallbackBg, { backgroundColor: item.backgroundColor || Colors.primary }]} />
              )}
              <View style={styles.overlay} />

              <View style={styles.bannerContent}>
                <Badge label={discountLabel} variant="accent" style={styles.badge} />
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
                {item.code && (
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeText}>Code: {item.code}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {promotions.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
  },
  bannerCard: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: Spacing.radiusLg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    position: 'relative',
  },
  pressed: {
    opacity: 0.95,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  fallbackBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(44, 29, 17, 0.45)',
  },
  bannerContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  badge: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.surfaceVariant,
    marginBottom: Spacing.xs,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radiusSm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  codeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.primary,
  },
});
