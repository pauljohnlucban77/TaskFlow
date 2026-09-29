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
import { productService, promotionService } from '../../services';
import { Product, Category } from '../../types/product';
import { Promotion } from '../../types/promotion';
import { useAnnouncements } from '../../context/AnnouncementsContext';
import { useLoyalty } from '../../hooks/useLoyalty';
import { LoyaltyCard } from '../../components/loyalty/LoyaltyCard';

export default function HomeScreen() {
  const router = useRouter();
  const {
    pinnedAnnouncement,
    unreadCount,
    urgentDismissed,
    dismissUrgent,
    announcements,
  } = useAnnouncements();

  const { account } = useLoyalty();

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
            <View style={styles.loyaltySection}>
              <SectionHeader
                title="Your Loyalty Card"
                subtitle="Earn points for every purchase"
              />
              <LoyaltyCard
                account={account}
                onPress={() => router.push('/loyalty' as any)}
              />
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
              {announcements.slice(0, 2).map((ann) => (
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
  profileButton: {
    marginLeft: Spacing.sm,
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
  loyaltySection: {
    marginVertical: Spacing.sm,
  },
  loyaltyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.xl,
    margin: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
