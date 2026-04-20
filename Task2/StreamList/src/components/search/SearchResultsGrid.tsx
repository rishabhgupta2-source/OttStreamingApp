import { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { Movie } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ContentCard } from '../common/ContentCard';
import { SkeletonCard } from '../common/SkeletonCard';

const SKELETON_KEYS = ['0', '1', '2', '3', '4', '5'] as const;

export type SearchResultsGridProps = {
  query: string;
  results: Movie[];
  loading: boolean;
  totalResults: number;
  error: string | null;
  onRetry: () => void;
  onCardPress: (id: number) => void;
};

export function SearchResultsGrid({
  query,
  results,
  loading,
  totalResults,
  error,
  onRetry,
  onCardPress,
}: SearchResultsGridProps) {
  const { width: windowWidth } = useWindowDimensions();

  const cardWidth = useMemo(() => {
    const raw = windowWidth / 2 - spacing.xxl;
    return raw > 0 ? raw : spacing.content_card_width;
  }, [windowWidth]);

  const trimmedQuery = query.trim();
  const showError = error !== null && trimmedQuery.length > 0;
  const showCount = results.length > 0;
  const showSkeletonGrid =
    !showError && loading && results.length === 0;
  const showResultsGrid = results.length > 0;
  const showZeroState =
    !showError &&
    !loading &&
    results.length === 0 &&
    trimmedQuery.length > 0;

  const renderSkeletonItem = useCallback<ListRenderItem<string>>(
    () => (
      <View style={styles.gridCellWrap}>
        <SkeletonCard width={cardWidth} />
      </View>
    ),
    [cardWidth],
  );

  const renderMovieItem = useCallback<ListRenderItem<Movie>>(
    ({ item }) => (
      <ContentCard
        includeBottomSpacing
        includeEndMargin={false}
        movie={item}
        onPress={onCardPress}
        width={cardWidth}
      />
    ),
    [cardWidth, onCardPress],
  );

  return (
    <View style={styles.root}>
      {showError ? (
        <View style={styles.errorRoot}>
          <Text style={[typography.body_md, styles.errorMessage]}>
            {error}
          </Text>
          <Pressable
            accessibilityLabel="Retry search"
            accessibilityRole="button"
            hitSlop={spacing.sm}
            onPress={onRetry}
            style={styles.retryPressable}
          >
            <Text style={[typography.title_sm, styles.retryLabel]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      {showCount ? (
        <Text style={styles.resultCount}>
          {`${String(totalResults)} results for '${query}'`}
        </Text>
      ) : null}

      {showSkeletonGrid ? (
        <FlatList
          columnWrapperStyle={styles.gridRow}
          data={[...SKELETON_KEYS]}
          keyExtractor={(item) => item}
          numColumns={2}
          renderItem={renderSkeletonItem}
          scrollEnabled={false}
        />
      ) : null}

      {showResultsGrid ? (
        <FlatList
          columnWrapperStyle={styles.gridRow}
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          renderItem={renderMovieItem}
          scrollEnabled={false}
        />
      ) : null}

      {showZeroState ? (
        <View style={styles.zeroRoot}>
          <MaterialIcons
            accessibilityElementsHidden
            color={colors.on_surface_variant}
            importantForAccessibility="no-hide-descendants"
            name="search"
            size={spacing.massive}
            style={styles.zeroSearchIcon}
          />
          <Text style={[typography.headline_md, styles.zeroTitle]}>
            {`No results for '${trimmedQuery}'`}
          </Text>
          <Text style={[typography.body_md, styles.zeroHint]}>
            Try a different title, actor, or genre
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  gridCellWrap: {
    marginBottom: spacing.lg,
  },
  errorRoot: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.massive + spacing.md,
  },
  errorMessage: {
    color: colors.on_surface,
    textAlign: 'center',
  },
  retryPressable: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryLabel: {
    color: colors.primary_container,
    textTransform: 'uppercase',
  },
  resultCount: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  zeroRoot: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.massive + spacing.md,
  },
  zeroSearchIcon: {
    marginBottom: spacing.lg,
  },
  zeroTitle: {
    color: colors.on_surface,
    textAlign: 'center',
  },
  zeroHint: {
    color: colors.on_surface_variant,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
