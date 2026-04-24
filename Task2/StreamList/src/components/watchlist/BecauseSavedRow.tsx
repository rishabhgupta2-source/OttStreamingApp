import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getSimilarMovies } from '../../api/movies';
import type { Movie } from '../../api/types';
import type { WatchlistItem } from '../../store/watchlistStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ContentCard } from '../common/ContentCard';
import { SkeletonCard } from '../common/SkeletonCard';

const SKELETON_COUNT = 4;

function dedupeMoviesById(movies: Movie[]): Movie[] {
  const seen = new Set<number>();
  const out: Movie[] = [];
  for (const m of movies) {
    if (seen.has(m.id)) {
      continue;
    }
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

export type BecauseSavedRowProps = {
  mostRecentItem: WatchlistItem;
  onCardPress: (movieId: number) => void;
  onViewAllPress?: () => void;
};

export function BecauseSavedRow({
  mostRecentItem,
  onCardPress,
  onViewAllPress,
}: BecauseSavedRowProps) {
  const isMovie = mostRecentItem.mediaType === 'movie';
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(isMovie);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!isMovie) {
      setSimilar([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSimilar([]);
    getSimilarMovies(mostRecentItem.id)
      .then((res) => {
        if (!cancelled) {
          const rows = Array.isArray(res.results) ? res.results : [];
          setSimilar(dedupeMoviesById(rows));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSimilar([]);
          setError(
            'Could not load suggestions. Check your connection and try again.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isMovie, mostRecentItem.id, refetchToken]);

  const keyExtractor = useCallback((item: Movie) => String(item.id), []);

  const renderItem = useCallback<ListRenderItem<Movie>>(
    ({ item }) => (
      <ContentCard
        includeEndMargin={false}
        movie={item}
        onPress={onCardPress}
        width={spacing.content_card_width}
      />
    ),
    [onCardPress],
  );

  const handleEndReached = useCallback(() => {
    // Similar list is a single TMDB page; no further pages to load.
  }, []);

  if (!isMovie) {
    return null;
  }

  if (!loading && similar.length === 0 && error === null) {
    return null;
  }

  const viewAllControl =
    onViewAllPress !== undefined ? (
      <Pressable
        accessibilityLabel="View all similar titles"
        accessibilityRole="button"
        hitSlop={spacing.sm}
        onPress={onViewAllPress}
        style={({ pressed }) => [pressed ? styles.viewAllPressed : null]}
      >
        <Text style={styles.viewAll}>View All</Text>
      </Pressable>
    ) : (
      <Text style={styles.viewAll}>View All</Text>
    );

  const header = (
    <View style={styles.header}>
      <Text numberOfLines={1} style={styles.headerTitle}>
        {`Because you saved ${mostRecentItem.title}`}
      </Text>
      {viewAllControl}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.section}>
        {header}
        <ScrollView
          contentContainerStyle={styles.skeletonScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <SkeletonCard
              key={`because-saved-skeleton-${String(index)}`}
              showCaptionSkeletons={false}
              width={spacing.content_card_width}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error !== null) {
    return (
      <View style={styles.section}>
        {header}
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityLabel="Retry loading suggestions"
            accessibilityRole="button"
            hitSlop={spacing.sm}
            onPress={() => {
              setRefetchToken((t) => t + 1);
            }}
            style={styles.retryPressable}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {header}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={similar}
        horizontal
        keyExtractor={keyExtractor}
        nestedScrollEnabled
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.title_lg.fontSize,
    color: colors.on_surface,
    flex: 1,
    marginRight: spacing.sm,
  },
  viewAll: {
    ...typography.title_sm,
    color: colors.primary_container,
  },
  viewAllPressed: {
    opacity: 0.7,
  },
  errorBlock: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  errorText: {
    ...typography.body_md,
    color: colors.on_surface_variant,
  },
  retryPressable: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  retryLabel: {
    ...typography.title_sm,
    color: colors.primary_container,
    textTransform: 'uppercase',
  },
  skeletonScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
