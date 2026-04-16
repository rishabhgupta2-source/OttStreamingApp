import { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet } from 'react-native';
import type { Genre } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { GenreChip } from '../common/GenreChip';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;
const SKELETON_PILL_COUNT = 4;

export type GenreFilterStripProps = {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelectGenre: (id: number | null) => void;
  loading: boolean;
};

export function GenreFilterStrip({
  genres,
  selectedGenreId,
  onSelectGenre,
  loading,
}: GenreFilterStripProps) {
  const opacity = useRef(
    new Animated.Value(SHIMMER_MIN_OPACITY),
  ).current;

  const showSkeletonPills = loading && genres.length === 0;

  useEffect(() => {
    if (!showSkeletonPills) {
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
  }, [opacity, showSkeletonPills]);

  const shimmerStyle = useMemo(
    () => ({ opacity }),
    [opacity],
  );

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.scrollContent}
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      <GenreChip
        isActive={selectedGenreId === null}
        label="All"
        onPress={() => {
          onSelectGenre(null);
        }}
      />
      {showSkeletonPills ? (
        <>
          {Array.from({ length: SKELETON_PILL_COUNT }, (_, index) => (
            <Animated.View
              key={`genre-skeleton-${String(index)}`}
              style={[styles.skeletonPill, shimmerStyle]}
            />
          ))}
        </>
      ) : (
        genres.map((genre) => (
          <GenreChip
            key={genre.id}
            isActive={selectedGenreId === genre.id}
            label={genre.name}
            onPress={() => {
              onSelectGenre(genre.id);
            }}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonPill: {
    width: spacing.genre_filter_skeleton_width,
    height: spacing.genre_filter_skeleton_height,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    backgroundColor: colors.surface_container_high,
  },
});
