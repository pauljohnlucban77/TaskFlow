import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { SearchBar } from '../../components/ui/SearchBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProductCard } from '../../components/bakery/ProductCard';
import { FeaturedProductCard } from '../../components/bakery/FeaturedProductCard';
import { CategoryCard } from '../../components/bakery/CategoryCard';
import { PromotionCarousel } from '../../components/promotions/PromotionCarousel';
import { AnnouncementBanner } from '../../components/announcements/AnnouncementBanner';
import { AnnouncementBell } from '../../components/announcements/AnnouncementBell';
import { IconButton } from '../../components/ui/IconButton';
import { LoyaltyCard } from '../../components/loyalty/LoyaltyCard';
import { productService, promotionService } from '../../services';
import { Product, Category } from '../../types/product';
import { Promotion } from '../../types/promotion';
import { useAnnouncements } from '../../context/AnnouncementsContext';
import { useLoyalty } from '../../hooks/useLoyalty';

export default function HomeScreen() {
  const router = useRouter();
  const {
    pinnedAnnouncement,
    unreadCount,
    urgentDismissed,
    dismissUrgent,
    announcements,
    error: announcementsError,
    refresh: refreshAnnouncements,
  } = useAnnouncements();

  const {
    balance,
    account,
    hasPurchased,
    error: loyaltyError,
    refresh: refreshLoyalty,
  } = useLoyalty();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [prodList, catList, featList, popList, promoList] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getFeaturedProducts(),
        productService.getPopularProducts(),
        promotionService.getActivePromotions(),
      ]);
      setProducts(prodList);
      setCategories(catList);
      setFeaturedProducts(featList);
      setPopularProducts(popList);
      setPromotions(promoList);
    } catch (e: any) {
      setError(e.message || 'Failed to load bakery catalog');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [searchQuery, products]);

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/(customer)/products',
      params: { category: categoryId },
    } as any);
  };

  const handlePromotionPress = (promotionId: string) => {
    const promotion = promotions.find((item) => item.id === promotionId);
    if (!promotion) {
      router.push(`/promotions/${promotionId}` as any);
      return;
    }

    if (promotion.applicableProductIds && promotion.applicableProductIds[0]) {
      router.push(`/products/${promotion.applicableProductIds[0]}` as any);
      return;
    }

    if (promotion.applicableCategoryIds && promotion.applicableCategoryIds[0]) {
      router.push({
        pathname: '/(customer)/products',
        params: { category: promotion.applicableCategoryIds[0] },
      } as any);
      return;
    }

    router.push(`/promotions/${promotionId}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.wordmarkContainer}>
          <Text style={styles.wordmarkTitle}>Fred's Pies</Text>
          <Text style={styles.wordmarkSubtitle}>Artisan Bakery & Cafe</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/loyalty' as any)}
            style={styles.pointsChip}
            accessibilityLabel="View Loyalty Points"
            accessibilityRole="button"
          >
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.pointsChipText}>{hasPurchased ? `${balance} pts` : 'Buy to earn points'}</Text>
          </Pressable>
          <AnnouncementBell
            unreadCount={unreadCount}
            onPress={() => router.push('/announcements' as any)}
          />
          <IconButton
            icon="person-outline"
            onPress={() => router.push('/(customer)/profile' as any)}
            accessibilityLabel="Customer Profile"
            style={styles.profileButton}
          />
        </View>
      </View>

      {/* Urgent Announcement Banner */}
      {pinnedAnnouncement && !urgentDismissed && (
        <AnnouncementBanner
          announcement={pinnedAnnouncement}
          onPress={() => router.push(`/announcements/${pinnedAnnouncement.id}` as any)}
          onDismiss={dismissUrgent}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Welcome Text & Search */}
        <View style={styles.searchSection}>
          <Text style={styles.welcomeText}>Freshly baked happiness, just for you.</Text>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>

        {!error && loyaltyError && (
          <ErrorState
            message={loyaltyError}
            onRetry={() => void refreshLoyalty()}
          />
        )}

        {error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : searchQuery.trim().length > 0 ? (
          /* Search Results View */
          <View style={styles.section}>
            <SectionHeader title={`Search Results (${searchResults.length})`} />
            {searchResults.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="No products found"
                message="Try searching for something else like 'apple pie', 'croissant', or 'cheesecake'."
              />
            ) : (
              <View style={styles.searchResultsGrid}>
                {searchResults.map((product) => (
                  <View key={product.id} style={styles.searchItemWrapper}>
                    <ProductCard
                      product={product}
                      onPress={() => router.push(`/products/${product.id}` as any)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* Normal Home Page Layout */
          <>
            {/* DYNAMIC DIGITAL LOYALTY CARD (Primary Visual Element on Home) */}
            <LoyaltyCard
              account={account}
              onPress={() => router.push('/loyalty' as any)}
            />

            {/* Quick Action Buttons Row */}
            <View style={styles.quickActionsRow}>
              <Pressable
                onPress={() => router.push('/(customer)/products' as any)}
                style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
              >
                <Ionicons name="basket-outline" size={18} color={Colors.primary} />
                <Text style={styles.quickActionText}>Products</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(customer)/orders' as any)}
                style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
              >
                <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                <Text style={styles.quickActionText}>My Orders</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/loyalty' as any)}
                style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
              >
                <Ionicons name="gift-outline" size={18} color={Colors.primary} />
                <Text style={styles.quickActionText}>Rewards</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/feedback/new' as any)}
                style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
              >
                <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
                <Text style={styles.quickActionText}>Feedback</Text>
              </Pressable>
            </View>

            {/* Promotions Carousel */}
            {promotions.length > 0 && (
              <PromotionCarousel
                promotions={promotions}
                onSelectPromotion={handlePromotionPress}
              />
            )}

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.categoriesList}
                renderItem={({ item }) => (
                  <CategoryCard
                    category={item}
                    onPress={() => handleCategoryPress(item.id)}
                  />
                )}
              />
            </View>

            {/* FEATURE CARD 2: Customer Feedback & Rating */}
            <View style={styles.feedbackHomeCard}>
              <View style={styles.feedbackCardHeader}>
                <Ionicons name="star" size={24} color={Colors.accent} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedbackCardTitle}>How Was Your Experience?</Text>
                  <Text style={styles.feedbackCardSubtitle}>
                    Share your review and rate our bakery pastries!
                  </Text>
                </View>
              </View>
              <View style={styles.feedbackButtonRow}>
                <Pressable
                  onPress={() => router.push('/feedback/new' as any)}
                  style={({ pressed }) => [styles.feedbackPrimaryButton, pressed && styles.pressed]}
                >
                  <Ionicons name="add-circle-outline" size={16} color={Colors.white} style={{ marginRight: 4 }} />
                  <Text style={styles.feedbackPrimaryText}>Give Feedback</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/feedback' as any)}
                  style={({ pressed }) => [styles.feedbackSecondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.feedbackSecondaryText}>My Reviews</Text>
                </Pressable>
              </View>
            </View>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Featured Masterpieces"
                  subtitle="Handcrafted daily by Master Baker Fred"
                />
                {featuredProducts.map((product) => (
                  <FeaturedProductCard
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/products/${product.id}` as any)}
                  />
                ))}
              </View>
            )}

            {/* Popular Today */}
            {popularProducts.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Popular Today"
                  subtitle="Customer favorites flying off the shelves"
                  actionText="View All"
                  onActionPress={() => router.push('/(customer)/products' as any)}
                />
                <FlatList
                  data={popularProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({ item }) => (
                    <ProductCard
                      product={item}
                      onPress={() => router.push(`/products/${item.id}` as any)}
                    />
                  )}
                />
              </View>
            )}

            {/* What's New (Announcements Preview) */}
            <View style={styles.section}>
              <SectionHeader
                title="What's New at Fred's"
                subtitle="Bakery updates & news"
                actionText="See all"
                onActionPress={() => router.push('/announcements' as any)}
              />
              {announcementsError ? (
                <ErrorState
                  message={announcementsError}
                  onRetry={() => void refreshAnnouncements()}
                />
              ) : announcements.slice(0, 2).map((ann) => (
                <Pressable
                  key={ann.id}
                  onPress={() => router.push(`/announcements/${ann.id}` as any)}
                  style={styles.announcementPreviewCard}
                  accessibilityLabel={`Announcement: ${ann.title}`}
                  accessibilityRole="button"
                >
                  <View style={styles.announcementHeader}>
                    <Text style={styles.announcementTitle} numberOfLines={1}>{ann.title}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.announcementMessage} numberOfLines={2}>{ann.message}</Text>
                </Pressable>
              ))}
            </View>

            {/* Today's Special Banner */}
            <View style={styles.specialBanner}>
              <Text style={styles.specialBannerEmoji}>🥖🥧</Text>
              <Text style={styles.specialBannerTitle}>Freshly Baked Every Day</Text>
              <Text style={styles.specialBannerText}>
                Made with quality ingredients and baked with care. Taste the Fred's tradition!
              </Text>
              <Pressable
                onPress={() => router.push('/promotions' as any)}
                style={({ pressed }) => [styles.specialButton, pressed && styles.pressedButton]}
                accessibilityLabel="View Specials"
                accessibilityRole="button"
              >
                <Text style={styles.specialButtonText}>View Specials & Deals</Text>
              </Pressable>
            </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  wordmarkContainer: {
    flex: 1,
  },
  wordmarkTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  wordmarkSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Spacing.radiusSm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  pointsChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    marginLeft: 4,
  },
  profileButton: {
    marginLeft: Spacing.xs,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  searchSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 3,
  },
  quickActionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: 2,
  },
  categoriesSection: {
    marginVertical: Spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginTop: Spacing.md,
  },
  horizontalList: {
    paddingHorizontal: Spacing.md,
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  searchItemWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  feedbackHomeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  feedbackCardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  feedbackCardSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  feedbackButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackPrimaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radiusMd,
    flex: 1,
    marginRight: Spacing.xs,
  },
  feedbackPrimaryText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  feedbackSecondaryButton: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radiusMd,
    flex: 1,
    marginLeft: Spacing.xs,
  },
  feedbackSecondaryText: {
    color: Colors.primaryDark,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  announcementPreviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  announcementTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  announcementMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  specialBanner: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Spacing.radiusLg,
    margin: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialBannerEmoji: {
    fontSize: 36,
    marginBottom: Spacing.xs,
  },
  specialBannerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  specialBannerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  specialButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
  },
  pressedButton: {
    opacity: 0.8,
  },
  specialButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semiBold,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
