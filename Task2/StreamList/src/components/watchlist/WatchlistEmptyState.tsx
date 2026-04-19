import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonCard } from '../common/SkeletonCard';
import { colors } from '../../theme/colors';
import { scrollPaddingBelowFloatingTabBar, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SKELETON_COUNT = 4;

export type WatchlistEmptyStateProps = {
  onBrowseTrending: () => void;
};

/**
 * Empty watchlist body (no top bar). Parent renders `WatchlistTopBar` above.
 */
export function WatchlistEmptyState({
  onBrowseTrending,
}: WatchlistEmptyStateProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: scrollPaddingBelowFloatingTabBar(insets.bottom) },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      <View style={styles.collectionBlock}>
        <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
        <Text style={styles.collectionTitle}>My Watchlist</Text>
        <Text style={styles.count}>0 titles</Text>
      </View>

      <View style={styles.emptyCenter}>
        <Ionicons
          accessibilityElementsHidden
          color={colors.secondary_container}
          importantForAccessibility="no-hide-descendants"
          name="bookmark"
          size={spacing.watchlist_empty_bookmark_icon_size}
          style={styles.emptyBookmark}
        />
        <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
        <Text style={styles.emptyBody}>
          {
            "Save movies and shows you want to watch later and they'll appear here"
          }
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Browse trending movies"
        accessibilityRole="button"
        onPress={onBrowseTrending}
        style={styles.ctaPressable}
      >
        <Text style={styles.ctaLabel}>Browse Trending Now</Text>
      </Pressable>

      <Text style={styles.popularLabel}>POPULAR RECOMMENDATIONS</Text>

      <ScrollView
        contentContainerStyle={styles.skeletonScrollContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <SkeletonCard
            key={`watchlist-empty-skeleton-${String(index)}`}
            showCaptionSkeletons={false}
            width={spacing.content_card_width}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  collectionBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  eyebrow: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: spacing.xs / 2,
  },
  collectionTitle: {
    ...typography.display_md,
    marginTop: spacing.xs / 2,
    color: colors.on_surface,
  },
  count: {
    ...typography.label_sm,
    marginTop: spacing.xs,
    color: colors.on_surface_variant,
  },
  emptyCenter: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyBookmark: {
    marginTop: spacing.massive,
  },
  emptyTitle: {
    ...typography.headline_md,
    color: colors.on_surface,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  emptyBody: {
    ...typography.body_md,
    color: colors.on_surface_variant,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  ctaPressable: {
    marginHorizontal: spacing.xxxl,
    marginTop: spacing.xxxl,
    height: spacing.watchlist_cta_height,
    borderRadius: spacing.md,
    backgroundColor: colors.primary_container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    ...typography.title_sm,
    color: colors.detail_nav_on_scrim,
  },
  popularLabel: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: spacing.xs / 4,
    textAlign: 'center',
    marginTop: spacing.huge,
    marginBottom: spacing.lg,
  },
  skeletonScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
