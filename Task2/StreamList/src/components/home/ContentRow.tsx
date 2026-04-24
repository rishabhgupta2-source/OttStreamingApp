import { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Movie } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ContentCard, type GenreNameMap } from '../common/ContentCard';
import { SkeletonCard } from '../common/SkeletonCard';

const SKELETON_PLACEHOLDER_COUNT = 4;

export type ContentRowProps = {
  title: string;
  data: Movie[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onCardPress: (movieId: number) => void;
  genreMap?: GenreNameMap;
  error?: string | null;
  onRetry?: () => void;
};

export function ContentRow({
  title,
  data,
  loading,
  hasMore,
  loadMore,
  onCardPress,
  genreMap,
  error = null,
  onRetry,
}: ContentRowProps) {
  const hasErrorMessage = error !== null && error.trim().length > 0;
  const showSkeletonRow =
    loading && data.length === 0 && !hasErrorMessage;
  const showErrorState =
    hasErrorMessage && data.length === 0 && !loading;
  const showEmptyState =
    !loading && !hasErrorMessage && data.length === 0;
  const showLoadMoreError =
    hasErrorMessage && data.length > 0 && !loading;

  const keyExtractor = useCallback((item: Movie) => String(item.id), []);

  const renderItem = useCallback<ListRenderItem<Movie>>(
    ({ item }) => (
      <ContentCard
        genreMap={genreMap}
        includeEndMargin={false}
        movie={item}
        onPress={onCardPress}
        width={spacing.content_card_width}
      />
    ),
    [genreMap, onCardPress],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loadMore, loading]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[typography.headline_md, styles.title]}>{title}</Text>
      </View>

      {showSkeletonRow ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.skeletonScrollContent}
          showsHorizontalScrollIndicator={false}
        >
          {Array.from({ length: SKELETON_PLACEHOLDER_COUNT }, (_, index) => (
            <SkeletonCard
              key={`content-row-skeleton-${String(index)}`}
              showCaptionSkeletons={false}
              width={spacing.content_card_width}
            />
          ))}
        </ScrollView>
      ) : null}

      {showErrorState ? (
        <View style={styles.emptyWrap}>
          <Text style={[typography.body_md, styles.emptyText]}>{error}</Text>
          {onRetry !== undefined ? (
            <TouchableOpacity
              accessibilityLabel={`Retry loading ${title}`}
              accessibilityRole="button"
              onPress={onRetry}
              style={styles.retryWrap}
            >
              <Text style={[typography.title_sm, styles.retryLabel]}>
                Try Again
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {showEmptyState ? (
        <View style={styles.emptyWrap}>
          <Text style={[typography.body_md, styles.emptyText]}>
            No content available
          </Text>
        </View>
      ) : null}

      {showLoadMoreError ? (
        <View style={styles.inlineErrorWrap}>
          <Text style={[typography.body_md, styles.inlineErrorText]}>
            {error}
          </Text>
          {onRetry !== undefined ? (
            <TouchableOpacity
              accessibilityLabel={`Retry ${title}`}
              accessibilityRole="button"
              onPress={onRetry}
              style={styles.retryWrap}
            >
              <Text style={[typography.title_sm, styles.retryLabel]}>
                Try Again
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {!showSkeletonRow && !showEmptyState && !showErrorState ? (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={data}
          horizontal
          keyExtractor={keyExtractor}
          nestedScrollEnabled
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      ) : null}
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
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.on_surface,
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
  emptyWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  retryWrap: {
    marginTop: spacing.md,
  },
  retryLabel: {
    color: colors.primary_container,
    textAlign: 'center',
  },
  inlineErrorWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  inlineErrorText: {
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
});
