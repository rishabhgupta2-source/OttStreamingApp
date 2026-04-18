import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useShallow } from 'zustand/react/shallow';
import { useWatchlistStore } from '../../store/watchlistStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;

export type WatchlistButtonProps = {
  movieId: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
  genreIds: number[];
};

export function WatchlistButton({
  movieId,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  genreIds,
}: WatchlistButtonProps) {
  const { addItem, removeItem, isInWatchlist, hydrated } = useWatchlistStore(
    useShallow((s) => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      isInWatchlist: s.isInWatchlist,
      hydrated: s.hydrated,
    })),
  );
  /** Subscribes to `items` so membership updates re-render (store `isInWatchlist` alone would not). */
  const inWatchlist = useWatchlistStore((s) =>
    s.items.some((item) => item.id === movieId),
  );

  const opacity = useRef(new Animated.Value(SHIMMER_MIN_OPACITY)).current;

  useEffect(() => {
    if (hydrated) {
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
  }, [hydrated, opacity]);

  const shimmerStyle = useMemo(() => ({ opacity }), [opacity]);

  const onPress = useCallback(() => {
    if (isInWatchlist(movieId)) {
      removeItem(movieId);
      return;
    }
    addItem({
      id: movieId,
      title,
      posterPath,
      voteAverage,
      releaseDate,
      genreIds,
      mediaType: 'movie',
    });
  }, [
    addItem,
    genreIds,
    isInWatchlist,
    movieId,
    posterPath,
    releaseDate,
    removeItem,
    title,
    voteAverage,
  ]);

  if (!hydrated) {
    return (
      <View style={styles.outer} accessibilityLabel="Loading watchlist state">
        <Animated.View
          style={[styles.shimmerSurface, styles.skeletonButton, shimmerStyle]}
        />
      </View>
    );
  }

  if (inWatchlist) {
    return (
      <View style={styles.outer}>
        <Pressable
          accessibilityLabel="Remove from watchlist"
          accessibilityRole="button"
          onPress={onPress}
          style={styles.addedPressable}
        >
          <View style={styles.addedInner}>
            <MaterialIcons
              accessibilityElementsHidden
              color={colors.watchlist_in_list_accent}
              importantForAccessibility="no-hide-descendants"
              name="bookmark-added"
              size={spacing.xxl}
            />
            <Text style={styles.labelAdded}>In Watchlist</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.outer}>
      <Pressable
        accessibilityLabel="Add to watchlist"
        accessibilityRole="button"
        onPress={onPress}
        style={styles.notAddedPressable}
      >
        <LinearGradient
          colors={[
            colors.watchlist_add_gradient_start,
            colors.watchlist_add_gradient_end,
          ]}
          end={{ x: 1, y: 1 }}
          locations={[0, 1]}
          start={{ x: 0, y: 0 }}
          style={styles.gradientInner}
        >
          <View style={styles.ctaRow}>
            <MaterialIcons
              accessibilityElementsHidden
              color={colors.surface}
              importantForAccessibility="no-hide-descendants"
              name="bookmark-add"
              size={spacing.xxl}
            />
            <Text style={styles.labelNotAdded}>Add to Watchlist</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  shimmerSurface: {
    backgroundColor: colors.surface_container_high,
  },
  skeletonButton: {
    width: '100%',
    height: spacing.watchlist_cta_height,
    borderRadius: spacing.md,
  },
  notAddedPressable: {
    width: '100%',
    borderRadius: spacing.md,
    overflow: 'hidden',
  },
  gradientInner: {
    width: '100%',
    height: spacing.watchlist_cta_height,
    borderRadius: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addedPressable: {
    width: '100%',
  },
  addedInner: {
    width: '100%',
    height: spacing.watchlist_cta_height,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.watchlist_in_list_accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  labelNotAdded: {
    ...typography.title_sm,
    color: colors.surface,
  },
  labelAdded: {
    ...typography.title_sm,
    color: colors.watchlist_in_list_accent,
  },
});
