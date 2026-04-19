import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type WatchlistFilter = 'all' | 'movies' | 'series';

export type WatchlistFilterChipsProps = {
  activeFilter: WatchlistFilter;
  onFilterChange: (filter: WatchlistFilter) => void;
};

const FILTERS: readonly { id: WatchlistFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'series', label: 'Series' },
];

/**
 * Full-width segmented All / Movies / Series (local filter; parent filters list).
 */
export function WatchlistFilterChips({
  activeFilter,
  onFilterChange,
}: WatchlistFilterChipsProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.strip}>
        {FILTERS.map(({ id, label }) => {
          const isActive = activeFilter === id;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={id}
              onPress={() => {
                onFilterChange(id);
              }}
              style={[styles.chip, isActive ? styles.chipActive : null]}
            >
              <Text style={isActive ? styles.labelActive : styles.labelInactive}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'stretch',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: colors.surface_container_high,
    borderRadius: spacing.watchlist_filter_strip_radius,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    flex: 1,
    minHeight: spacing.xxxl + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.watchlist_filter_chip_radius,
  },
  chipActive: {
    backgroundColor: colors.primary_container,
  },
  labelActive: {
    ...typography.title_sm,
    color: colors.rating_pill_on_overlay,
  },
  labelInactive: {
    ...typography.body_md,
    color: colors.on_surface_variant,
  },
});
