import { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type { Movie } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getImageUrl } from '../../utils/image';

export type GenreNameMap = Record<number, string>;

export type ContentCardProps = {
  movie: Movie;
  onPress: (movieId: number) => void;
  width?: number;
  genreMap?: GenreNameMap;
  /** When false, omits trailing margin (e.g. horizontal FlatList with `gap`). Default true. */
  includeEndMargin?: boolean;
};

function formatSubtitle(movie: Movie, genreMap: GenreNameMap | undefined): string {
  const year =
    movie.release_date.length > 0 ? movie.release_date.split('-')[0] ?? '' : '';
  const firstGenreId = movie.genre_ids[0];
  const genreName =
    firstGenreId !== undefined && genreMap !== undefined
      ? genreMap[firstGenreId]
      : undefined;
  if (genreName !== undefined && genreName.length > 0 && year.length > 0) {
    return `${year} • ${genreName}`;
  }
  if (year.length > 0) {
    return year;
  }
  if (genreName !== undefined && genreName.length > 0) {
    return genreName;
  }
  return '';
}

function shouldShowRating(voteAverage: number | null | undefined): boolean {
  if (voteAverage == null || voteAverage === 0) {
    return false;
  }
  return Number.isFinite(voteAverage);
}

export function ContentCard({
  movie,
  onPress,
  width,
  genreMap,
  includeEndMargin = true,
}: ContentCardProps) {
  const cardWidth = width ?? spacing.content_card_width;
  const posterHeight = useMemo(() => cardWidth * 1.5, [cardWidth]);
  const posterUri = getImageUrl(movie.poster_path, 'w342');
  const subtitle = useMemo(
    () => formatSubtitle(movie, genreMap),
    [movie, genreMap],
  );
  const showRating = shouldShowRating(movie.vote_average);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      onPress={() => {
        onPress(movie.id);
      }}
      style={[{ width: cardWidth }, includeEndMargin ? styles.cardEndMargin : null]}
    >
      <View style={[styles.posterFrame, { height: posterHeight }]}>
        {posterUri !== null ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: posterUri }}
            style={styles.posterImage}
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name="hide-image"
              size={spacing.xxxl}
              color={colors.on_surface_variant}
            />
          </View>
        )}
        {showRating ? (
          <View style={styles.ratingBadge}>
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name="star"
              size={typography.label_sm.fontSize}
              color={colors.primary_container}
              style={styles.ratingStar}
            />
            <Text style={[typography.label_sm, styles.ratingText]}>
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[typography.title_lg, styles.title]}>
        {movie.title}
      </Text>
      {subtitle.length > 0 ? (
        <Text numberOfLines={1} style={[typography.label_sm, styles.subtitle]}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardEndMargin: {
    marginRight: spacing.md,
  },
  posterFrame: {
    width: '100%',
    borderRadius: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface_container_high,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface_container_high,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_highest,
  },
  ratingStar: {
    marginRight: spacing.xs,
  },
  ratingText: {
    color: colors.on_surface,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.on_surface,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.on_surface_variant,
  },
});
