import { useMemo } from 'react';
import {
  Image,
  Pressable,
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
import { SkeletonCard } from '../common/SkeletonCard';

const HERO_WIDTH_RATIO = 0.9;

export type HeroCardProps = {
  movie: Movie | null;
  onDetailsPress: (movieId: number) => void;
};

export function HeroCard({ movie, onDetailsPress }: HeroCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = useMemo(
    () => windowWidth * HERO_WIDTH_RATIO,
    [windowWidth],
  );

  if (movie === null) {
    return (
      <View style={[styles.cardOuter, { width: cardWidth }]}>
        <SkeletonCard
          posterHeight={spacing.hero_backdrop_height}
          showCaptionSkeletons={false}
          width={cardWidth}
        />
      </View>
    );
  }

  const backdropUri = getImageUrl(movie.backdrop_path, 'w780');
  const synopsisVisible = movie.overview.trim().length > 0;

  return (
    <View style={[styles.cardOuter, { width: cardWidth }]}>
      <View style={styles.mediaBlock}>
        {backdropUri !== null ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{ uri: backdropUri }}
            style={styles.backdrop}
          />
        ) : (
          <View style={styles.backdropPlaceholder} />
        )}
        <LinearGradient
          colors={['transparent', colors.surface]}
          pointerEvents="none"
          style={styles.bottomGradient}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>NEW RELEASE</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[typography.display_md, styles.title]}>{movie.title}</Text>
        {synopsisVisible ? (
          <Text numberOfLines={2} style={[typography.body_md, styles.synopsis]}>
            {movie.overview}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Watch now"
            accessibilityRole="button"
            onPress={() => {}}
            style={styles.watchNowPressable}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary_container]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.watchNowGradient}
            >
              <View style={styles.watchNowInner}>
                <Text style={[typography.title_sm, styles.watchNowPlay]}>▶</Text>
                <Text style={[typography.title_sm, styles.watchNowLabel]}>
                  Watch Now
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            accessibilityLabel="Details"
            accessibilityRole="button"
            onPress={() => {
              onDetailsPress(movie.id);
            }}
            style={styles.detailsButton}
          >
            <Text style={[typography.title_sm, styles.detailsLabel]}>
              Details
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    alignSelf: 'center',
    marginBottom: spacing.xxl,
    borderRadius: spacing.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  mediaBlock: {
    position: 'relative',
    width: '100%',
    height: spacing.hero_backdrop_height,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface_container_high,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: spacing.hero_gradient_height,
  },
  badge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.primary_container,
  },
  badgeLabel: {
    fontFamily: typography.title_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    letterSpacing: typography.label_sm.letterSpacing,
    color: colors.on_surface,
    textTransform: 'uppercase',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    marginTop: spacing.hero_title_overlap,
    color: colors.on_surface,
  },
  synopsis: {
    marginTop: spacing.sm,
    color: colors.on_surface_variant,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  watchNowPressable: {
    flex: 1,
  },
  watchNowGradient: {
    height: spacing.massive,
    borderRadius: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchNowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchNowPlay: {
    marginRight: spacing.xs,
    color: colors.on_surface,
  },
  watchNowLabel: {
    color: colors.on_surface,
  },
  detailsButton: {
    flex: 1,
    height: spacing.massive,
    borderRadius: spacing.md,
    backgroundColor: colors.surface_container_highest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsLabel: {
    color: colors.on_surface,
  },
});
