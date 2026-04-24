import { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  TMDB_MOVIE_GENRE_ID_NAMES,
  TMDB_TV_GENRE_ID_NAMES,
} from '../../constants/tmdbGenreNames';
import type { WatchlistItem } from '../../store/watchlistStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getImageUrl } from '../../utils/image';

export type WatchlistCardProps = {
  item: WatchlistItem;
  onRemove: (id: number) => void;
  onDetailsPress: (id: number) => void;
};

function releaseYear(releaseDate: string): string {
  if (releaseDate.length === 0) {
    return '';
  }
  return releaseDate.split('-')[0] ?? '';
}

function formatSubtitle(item: WatchlistItem): string {
  const year = releaseYear(item.releaseDate);
  const firstId = item.genreIds[0];
  const genreMap =
    item.mediaType === 'tv' ? TMDB_TV_GENRE_ID_NAMES : TMDB_MOVIE_GENRE_ID_NAMES;
  const genreName =
    firstId !== undefined ? genreMap[firstId] : undefined;
  const genrePart =
    genreName !== undefined && genreName.length > 0 ? genreName : '';
  if (year.length > 0 && genrePart.length > 0) {
    return `${year} • ${genrePart}`;
  }
  if (year.length > 0) {
    return year;
  }
  if (genrePart.length > 0) {
    return genrePart;
  }
  return '';
}

function shouldShowRating(voteAverage: number): boolean {
  if (voteAverage === 0 || !Number.isFinite(voteAverage)) {
    return false;
  }
  return true;
}

export function WatchlistCard({
  item,
  onRemove,
  onDetailsPress,
}: WatchlistCardProps) {
  const showDetails = item.mediaType === 'movie';
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = useMemo(
    () => windowWidth / 2 - spacing.xxl,
    [windowWidth],
  );
  const posterHeight = useMemo(() => cardWidth * 1.5, [cardWidth]);
  const posterUri = getImageUrl(item.posterPath, 'w342');
  const subtitle = useMemo(() => formatSubtitle(item), [item]);
  const showRating = shouldShowRating(item.voteAverage);

  return (
    <View style={[styles.cardShell, { width: cardWidth }]}>
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
            <Text style={styles.placeholderEmoji}>🎬</Text>
          </View>
        )}
        {showRating ? (
          <View style={styles.ratingBadge} accessibilityLabel="Rating">
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingValue}>
              {item.voteAverage.toFixed(1)}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          accessibilityLabel="Remove from watchlist"
          accessibilityRole="button"
          hitSlop={{
            top: spacing.xs,
            bottom: spacing.xs,
            left: spacing.xs,
            right: spacing.xs,
          }}
          onPress={() => {
            onRemove(item.id);
          }}
          style={styles.removeButton}
        >
          <Text style={styles.removeGlyph}>×</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
        {subtitle.length > 0 ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        {showDetails ? (
          <TouchableOpacity
            accessibilityLabel="View details"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => {
              onDetailsPress(item.id);
            }}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsLabel}>Details</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.detailsPlaceholder} accessibilityElementsHidden>
            <Text style={styles.detailsUnavailableLabel}>
              Details not available for series
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    flexShrink: 0,
    backgroundColor: colors.surface_container_low,
    borderRadius: spacing.lg,
    overflow: 'hidden',
  },
  posterFrame: {
    width: '100%',
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
  placeholderEmoji: {
    fontSize: spacing.xxxl,
    lineHeight: spacing.xxxl,
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
    ...typography.label_sm,
    marginRight: spacing.xs,
    color: colors.on_surface_variant,
  },
  ratingValue: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.huge,
    right: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.surface_container_highest,
  },
  removeGlyph: {
    ...typography.label_sm,
    fontSize: spacing.lg,
    lineHeight: spacing.lg,
    color: colors.on_surface,
    textAlign: 'center',
  },
  cardBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.title_lg,
    marginTop: spacing.sm,
    color: colors.on_surface,
  },
  subtitle: {
    ...typography.label_sm,
    marginTop: spacing.xs,
    color: colors.on_surface_variant,
  },
  detailsButton: {
    width: '100%',
    height: spacing.detail_hero_title_skeleton_height,
    marginTop: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_highest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsLabel: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  detailsPlaceholder: {
    width: '100%',
    height: spacing.detail_hero_title_skeleton_height,
    marginTop: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsUnavailableLabel: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
});
