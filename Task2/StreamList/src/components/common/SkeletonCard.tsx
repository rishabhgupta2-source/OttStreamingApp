import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;

export type SkeletonCardProps = {
  width?: number;
  /** Fixed poster block height (e.g. hero). Defaults to 2:3 from width. */
  posterHeight?: number;
  /** When false, only the poster shimmer is shown (e.g. hero loading). */
  showCaptionSkeletons?: boolean;
};

export function SkeletonCard({
  width,
  posterHeight: posterHeightProp,
  showCaptionSkeletons = true,
}: SkeletonCardProps) {
  const cardWidth = width ?? spacing.content_card_width;
  const posterHeight = useMemo(
    () => posterHeightProp ?? cardWidth * 1.5,
    [cardWidth, posterHeightProp],
  );
  const opacity = useRef(
    new Animated.Value(SHIMMER_MIN_OPACITY),
  ).current;

  useEffect(() => {
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
  }, [opacity]);

  const shimmerStyle = useMemo(
    () => ({ opacity }),
    [opacity],
  );

  return (
    <View style={[styles.root, { width: cardWidth }]}>
      <Animated.View
        style={[
          styles.shimmerSurface,
          styles.poster,
          { height: posterHeight },
          shimmerStyle,
        ]}
      />
      {showCaptionSkeletons ? (
        <>
          <Animated.View
            style={[
              styles.shimmerSurface,
              styles.titleLine,
              shimmerStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.shimmerSurface,
              styles.subtitleLine,
              shimmerStyle,
            ]}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
  },
  shimmerSurface: {
    backgroundColor: colors.surface_container_high,
  },
  poster: {
    width: '100%',
    borderRadius: spacing.lg,
  },
  titleLine: {
    alignSelf: 'flex-start',
    width: '80%',
    height: spacing.lg,
    borderRadius: spacing.xs,
    marginTop: spacing.sm,
  },
  subtitleLine: {
    alignSelf: 'flex-start',
    width: '50%',
    height: spacing.md,
    borderRadius: spacing.xs,
    marginTop: spacing.xxs,
  },
});
