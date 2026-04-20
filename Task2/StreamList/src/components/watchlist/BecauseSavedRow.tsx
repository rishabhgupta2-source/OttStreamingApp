import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  type ListRenderItem,
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

export type BecauseSavedRowProps = {
  mostRecentItem: WatchlistItem;
  onCardPress: (movieId: number) => void;
};

export function BecauseSavedRow({
  mostRecentItem,
  onCardPress,
}: BecauseSavedRowProps) {
  const isMovie = mostRecentItem.mediaType === 'movie';
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(isMovie);

  useEffect(() => {
    if (!isMovie) {
      setSimilar([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSimilar([]);
    getSimilarMovies(mostRecentItem.id)
      .then((res) => {
        if (!cancelled) {
          const rows = Array.isArray(res.results) ? res.results : [];
          setSimilar(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSimilar([]);
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
  }, [isMovie, mostRecentItem.id]);

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

  if (!loading && similar.length === 0) {
    return null;
  }

  const header = (
    <View style={styles.header}>
      <Text numberOfLines={1} style={styles.headerTitle}>
        {`Because you saved ${mostRecentItem.title}`}
      </Text>
      <Text style={styles.viewAll}>View All</Text>
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

  return (
    <View style={styles.section}>
      {header}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={similar}
        horizontal
        keyExtractor={keyExtractor}
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
