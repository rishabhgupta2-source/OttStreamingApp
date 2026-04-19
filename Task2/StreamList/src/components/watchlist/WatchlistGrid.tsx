import { useCallback, useMemo } from 'react';
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GenreChip } from '../common/GenreChip';
import {
  type WatchlistItem,
  useWatchlistStore,
} from '../../store/watchlistStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { WatchlistCard } from './WatchlistCard';
import type { WatchlistFilter } from './WatchlistFilterChips';

export type WatchlistGridProps = {
  items: WatchlistItem[];
  activeFilter: WatchlistFilter;
  onDetailsPress: (id: number) => void;
  onResetFilter: () => void;
};

function filterItems(
  items: WatchlistItem[],
  activeFilter: WatchlistFilter,
): WatchlistItem[] {
  if (activeFilter === 'all') {
    return items;
  }
  return items.filter((i) =>
    activeFilter === 'movies' ? i.mediaType === 'movie' : i.mediaType === 'tv',
  );
}

export function WatchlistGrid({
  items,
  activeFilter,
  onDetailsPress,
  onResetFilter,
}: WatchlistGridProps) {
  const removeItem = useWatchlistStore((state) => state.removeItem);

  const filteredItems = useMemo(
    () => filterItems(items, activeFilter),
    [items, activeFilter],
  );

  const showEmptyFilterMessage =
    filteredItems.length === 0 && items.length > 0;

  const renderItem = useCallback<ListRenderItem<WatchlistItem>>(
    ({ item }) => (
      <View style={styles.cellWrap}>
        <WatchlistCard
          item={item}
          onDetailsPress={onDetailsPress}
          onRemove={(id) => {
            removeItem(id);
          }}
        />
      </View>
    ),
    [onDetailsPress, removeItem],
  );

  if (showEmptyFilterMessage) {
    const label = activeFilter === 'movies' ? 'Movies' : 'Series';
    return (
      <View style={styles.emptyFilterRoot}>
        <Text style={styles.emptyFilterText}>
          {`No ${label} in your watchlist yet`}
        </Text>
        <GenreChip
          isActive={false}
          label="Browse All"
          onPress={onResetFilter}
        />
      </View>
    );
  }

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <FlatList
      columnWrapperStyle={styles.gridRow}
      data={filteredItems}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  emptyFilterRoot: {
    alignItems: 'center',
    paddingTop: spacing.huge,
    paddingHorizontal: spacing.xxxl,
  },
  emptyFilterText: {
    ...typography.body_md,
    color: colors.on_surface_variant,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cellWrap: {
    marginBottom: spacing.lg,
  },
});
