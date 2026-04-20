import { useCallback, useMemo } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Movie } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getImageUrl } from '../../utils/image';
import { ContentCard, type GenreNameMap } from '../common/ContentCard';
import { GenreChip } from '../common/GenreChip';
import { SkeletonCard } from '../common/SkeletonCard';
import { RecentSearches } from './RecentSearches';

const QUICK_GENRE_NAMES = [
  'Action',
  'Drama',
  'Comedy',
  'Sci-Fi',
  'Horror',
  'Documentary',
] as const;

const TRENDING_GRID_SKELETON_KEYS = [
  'tg-0',
  'tg-1',
  'tg-2',
  'tg-3',
  'tg-4',
  'tg-5',
] as const;

/** TMDB movie genre ids — mirrors API `/genre/movie/list` names for list-item `genre_ids`. */
const TMDB_GENRE_ID_NAMES: GenreNameMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const FEATURED_CARD_HEIGHT =
  spacing.content_card_width + spacing.huge;

const FEATURED_GRADIENT_HEIGHT = spacing.xxl * 3;

export type SearchDefaultViewProps = {
  recentSearches: string[];
  onSelectSearch: (term: string) => void;
  onClearAll: () => void;
  onGenreSelect: (genreName: string) => void;
  trendingMovies: Movie[];
  trendingLoading: boolean;
  onCardPress: (movieId: number) => void;
};

function formatFeaturedSubtitle(movie: Movie): string {
  const rawDate = movie.release_date;
  const year =
    rawDate != null && rawDate.length > 0 ? rawDate.split('-')[0] ?? '' : '';
  const firstGenreId = movie.genre_ids?.[0];
  const genreName =
    firstGenreId !== undefined
      ? TMDB_GENRE_ID_NAMES[firstGenreId]
      : undefined;
  if (genreName !== undefined && genreName.length > 0 && year.length > 0) {
    return `${genreName} • ${year}`;
  }
  if (year.length > 0) {
    return year;
  }
  if (genreName !== undefined && genreName.length > 0) {
    return genreName;
  }
  return '';
}

export function SearchDefaultView({
  recentSearches,
  onSelectSearch,
  onClearAll,
  onGenreSelect,
  trendingMovies,
  trendingLoading,
  onCardPress,
}: SearchDefaultViewProps) {
  const { width: windowWidth } = useWindowDimensions();

  const featuredWidth = useMemo(
    () => Math.max(0, windowWidth - spacing.lg * 2),
    [windowWidth],
  );

  const gridCardWidth = useMemo(() => {
    const raw = windowWidth / 2 - spacing.xxl;
    return raw > 0 ? raw : spacing.content_card_width;
  }, [windowWidth]);

  const showTrendingSection =
    trendingLoading || trendingMovies.length > 0;

  const featuredMovie = trendingMovies[0];
  const featuredBackdropUri = useMemo(
    () =>
      featuredMovie !== undefined
        ? getImageUrl(featuredMovie.backdrop_path, 'w780')
        : null,
    [featuredMovie],
  );
  const featuredSubtitleText = useMemo(
    () =>
      featuredMovie !== undefined
        ? formatFeaturedSubtitle(featuredMovie)
        : '',
    [featuredMovie],
  );
  const gridMovies = useMemo(
    () => trendingMovies.slice(1),
    [trendingMovies],
  );

  const showTrendingSkeleton =
    trendingLoading && trendingMovies.length === 0;

  const renderGridItem = useCallback<ListRenderItem<Movie>>(
    ({ item }) => (
      <ContentCard
        genreMap={TMDB_GENRE_ID_NAMES}
        includeBottomSpacing
        includeEndMargin={false}
        movie={item}
        onPress={onCardPress}
        width={gridCardWidth}
      />
    ),
    [gridCardWidth, onCardPress],
  );

  const renderGridSkeletonItem = useCallback<ListRenderItem<string>>(
    () => (
      <View style={styles.gridCellWrap}>
        <SkeletonCard width={gridCardWidth} />
      </View>
    ),
    [gridCardWidth],
  );

  const handleGridEndReached = useCallback(() => {
    // Static list — no pagination; satisfies content-row FlatList convention.
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.genreScrollContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {QUICK_GENRE_NAMES.map((name) => (
          <GenreChip
            isActive={false}
            key={name}
            label={name}
            onPress={() => {
              onGenreSelect(name);
            }}
          />
        ))}
      </ScrollView>

      <RecentSearches
        onClearAll={onClearAll}
        onSelectSearch={onSelectSearch}
        searches={recentSearches}
      />

      {showTrendingSection ? (
        <View style={styles.trendingBlock}>
          <Text style={[typography.headline_md, styles.trendingTitle]}>
            Trending Now
          </Text>

          {showTrendingSkeleton ? (
            <>
              <View
                style={[
                  styles.featuredSkeletonWrap,
                  { width: featuredWidth },
                ]}
              >
                <SkeletonCard
                  posterHeight={FEATURED_CARD_HEIGHT}
                  showCaptionSkeletons={false}
                  width={featuredWidth}
                />
              </View>
              <FlatList
                columnWrapperStyle={styles.gridRow}
                data={[...TRENDING_GRID_SKELETON_KEYS]}
                keyExtractor={(item) => item}
                numColumns={2}
                onEndReached={handleGridEndReached}
                onEndReachedThreshold={0.3}
                renderItem={renderGridSkeletonItem}
                scrollEnabled={false}
              />
            </>
          ) : null}

          {!showTrendingSkeleton && featuredMovie !== undefined ? (
            <>
              <Pressable
                accessibilityLabel={`Featured: ${featuredMovie.title}`}
                accessibilityRole="button"
                onPress={() => {
                  onCardPress(featuredMovie.id);
                }}
                style={({ pressed }) => [
                  styles.featuredPressable,
                  { width: featuredWidth },
                  pressed ? styles.featuredPressed : null,
                ]}
              >
                <View
                  style={[
                    styles.featuredFrame,
                    { height: FEATURED_CARD_HEIGHT },
                  ]}
                >
                  {featuredBackdropUri !== null ? (
                    <Image
                      accessibilityIgnoresInvertColors
                      resizeMode="cover"
                      source={{ uri: featuredBackdropUri }}
                      style={styles.featuredImage}
                    />
                  ) : (
                    <View style={styles.featuredPlaceholder} />
                  )}
                  <LinearGradient
                    colors={[colors.transparent, colors.surface]}
                    pointerEvents="none"
                    style={styles.featuredGradient}
                  />
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeLabel}>FEATURED</Text>
                  </View>
                  <View style={styles.featuredTextWrap}>
                    <Text
                      numberOfLines={2}
                      style={[typography.title_lg, styles.featuredTitle]}
                    >
                      {featuredMovie.title}
                    </Text>
                    {featuredSubtitleText.length > 0 ? (
                      <Text
                        numberOfLines={1}
                        style={[
                          typography.body_md,
                          styles.featuredSubtitle,
                        ]}
                      >
                        {featuredSubtitleText}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>

              {gridMovies.length > 0 ? (
                <FlatList
                  columnWrapperStyle={styles.gridRow}
                  data={gridMovies}
                  keyExtractor={(item) => String(item.id)}
                  numColumns={2}
                  onEndReached={handleGridEndReached}
                  onEndReachedThreshold={0.3}
                  renderItem={renderGridItem}
                  scrollEnabled={false}
                />
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  genreScrollContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingBlock: {
    width: '100%',
  },
  trendingTitle: {
    color: colors.on_surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  featuredSkeletonWrap: {
    alignSelf: 'center',
    borderRadius: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  featuredPressable: {
    alignSelf: 'center',
    borderRadius: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  featuredPressed: {
    opacity: 0.92,
  },
  featuredFrame: {
    width: '100%',
    borderRadius: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface_container_high,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface_container_high,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FEATURED_GRADIENT_HEIGHT,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.secondary_container,
  },
  featuredBadgeLabel: {
    fontFamily: typography.title_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    letterSpacing: typography.label_sm.letterSpacing,
    color: colors.on_surface,
    textTransform: 'uppercase',
  },
  featuredTextWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  featuredTitle: {
    color: colors.on_surface,
  },
  featuredSubtitle: {
    marginTop: spacing.xs,
    color: colors.on_surface_variant,
  },
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  gridCellWrap: {
    marginBottom: spacing.lg,
  },
});
