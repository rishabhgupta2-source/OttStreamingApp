import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SkeletonCard } from '../common/SkeletonCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const GRID_ROWS = [
  ['hydrate-0', 'hydrate-1'],
  ['hydrate-2', 'hydrate-3'],
] as const;

export type WatchlistHydrationSkeletonProps = {
  paddingBottom: number;
};

/**
 * Shown while watchlist persist rehydrates — no real items, no spinner (project rules).
 */
export function WatchlistHydrationSkeleton({
  paddingBottom,
}: WatchlistHydrationSkeletonProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = useMemo(
    () => Math.max(0, windowWidth / 2 - spacing.xxl),
    [windowWidth],
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      <View style={styles.headerBlock}>
        <View style={styles.headerLineWide} />
        <View style={styles.headerLineTitle} />
        <View style={styles.headerLineMeta} />
      </View>
      <View style={styles.filterRow}>
        <View style={styles.filterPill} />
        <View style={styles.filterPill} />
        <View style={styles.filterPill} />
      </View>
      {GRID_ROWS.map((row) => (
        <View key={row.join('-')} style={styles.gridRow}>
          {row.map((key) => (
            <View key={key} style={{ width: cardWidth }}>
              <SkeletonCard showCaptionSkeletons width={cardWidth} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  headerBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerLineWide: {
    height: spacing.metadata_chip_skeleton_height,
    width: spacing.genre_filter_skeleton_width * 2,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_high,
    marginBottom: spacing.sm,
  },
  headerLineTitle: {
    height: spacing.detail_hero_title_skeleton_height,
    width: '72%',
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_high,
    marginBottom: spacing.sm,
  },
  headerLineMeta: {
    height: spacing.metadata_chip_skeleton_height,
    width: spacing.genre_filter_skeleton_width + spacing.md,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_high,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    width: spacing.genre_filter_skeleton_width + spacing.sm,
    height: spacing.genre_filter_skeleton_height,
    borderRadius: spacing.xl,
    backgroundColor: colors.surface_container_high,
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
});
