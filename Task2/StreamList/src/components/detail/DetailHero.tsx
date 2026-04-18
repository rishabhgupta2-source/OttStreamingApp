import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getImageUrl } from '../../utils/image';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;

export type DetailHeroProps = {
  backdropPath: string | null;
  title: string;
  loading: boolean;
};

export function DetailHero({
  backdropPath,
  title,
  loading,
}: DetailHeroProps) {
  const opacity = useRef(new Animated.Value(SHIMMER_MIN_OPACITY)).current;

  useEffect(() => {
    if (!loading) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: SHIMMER_MAX_OPACITY,
          duration: SHIMMER_HALF_CYCLE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: SHIMMER_MIN_OPACITY,
          duration: SHIMMER_HALF_CYCLE_MS,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [loading, opacity]);

  const shimmerStyle = useMemo(() => ({ opacity }), [opacity]);

  const normalizedBackdropPath =
    backdropPath !== null && backdropPath.trim().length > 0
      ? backdropPath
      : null;
  const backdropUri = getImageUrl(normalizedBackdropPath, 'w780');
  const displayTitle = title.trim() === '' ? 'Unknown Title' : title;

  if (loading) {
    return (
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.shimmerSurface,
            styles.skeletonBackdrop,
            shimmerStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.shimmerSurface,
            styles.skeletonTitleLine,
            shimmerStyle,
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.mediaWrap,
          backdropUri === null ? styles.mediaCenter : styles.mediaClip,
        ]}
      >
        {backdropUri !== null ? (
          <>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={displayTitle}
              resizeMode="cover"
              source={{ uri: backdropUri }}
              style={styles.backdropImage}
            />
            <LinearGradient
              colors={['transparent', colors.surface]}
              pointerEvents="none"
              style={styles.bottomGradient}
            />
          </>
        ) : (
          <Text style={styles.placeholderEmoji}>🎬</Text>
        )}
      </View>
      <Text style={styles.title}>{displayTitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  shimmerSurface: {
    backgroundColor: colors.surface_container_high,
  },
  skeletonBackdrop: {
    width: '100%',
    height: spacing.detail_hero_backdrop_height,
  },
  skeletonTitleLine: {
    alignSelf: 'flex-start',
    width: '60%',
    height: spacing.detail_hero_title_skeleton_height,
    borderRadius: spacing.xs,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  mediaWrap: {
    width: '100%',
    height: spacing.detail_hero_backdrop_height,
    backgroundColor: colors.surface_container_high,
  },
  mediaClip: {
    overflow: 'hidden',
  },
  mediaCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: spacing.detail_hero_gradient_height,
  },
  placeholderEmoji: {
    fontSize: spacing.massive,
    color: colors.on_surface_variant,
  },
  title: {
    ...typography.display_md,
    color: colors.on_surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
