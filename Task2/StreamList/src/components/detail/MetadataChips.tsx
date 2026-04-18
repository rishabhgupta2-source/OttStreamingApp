import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { Genre } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;

export type MetadataChipsProps = {
  releaseDate: string | null;
  voteAverage: number | null;
  genres: Genre[];
  runtime: number | null;
  loading: boolean;
};

type ChipItem = { key: string; label: string };

function yearLabel(releaseDate: string | null): string | null {
  if (releaseDate === null || releaseDate.trim() === '') {
    return null;
  }
  const first = releaseDate.split('-')[0];
  if (first === undefined || first === '') {
    return null;
  }
  return first;
}

function shouldShowRatingChip(
  voteAverage: number | null,
): voteAverage is number {
  return (
    voteAverage !== null &&
    Number.isFinite(voteAverage) &&
    voteAverage !== 0
  );
}

function shouldShowRuntimeChip(runtime: number | null): runtime is number {
  return (
    runtime !== null &&
    Number.isFinite(runtime) &&
    runtime > 0
  );
}

function buildChips(
  releaseDate: string | null,
  voteAverage: number | null,
  genres: Genre[],
  runtime: number | null,
): ChipItem[] {
  const out: ChipItem[] = [];

  const year = yearLabel(releaseDate);
  if (year !== null) {
    out.push({ key: 'year', label: year });
  }

  if (shouldShowRatingChip(voteAverage)) {
    out.push({
      key: 'rating',
      label: `★ ${voteAverage.toFixed(1)}`,
    });
  }

  const primaryGenre = genres[0];
  if (
    primaryGenre !== undefined &&
    primaryGenre.name.trim().length > 0
  ) {
    out.push({ key: 'genre', label: primaryGenre.name });
  }

  if (shouldShowRuntimeChip(runtime)) {
    out.push({ key: 'runtime', label: `${runtime} min` });
  }

  return out;
}

export function MetadataChips({
  releaseDate,
  voteAverage,
  genres,
  runtime,
  loading,
}: MetadataChipsProps) {
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

  const chips = useMemo(
    () => buildChips(releaseDate, voteAverage, genres, runtime),
    [genres, releaseDate, runtime, voteAverage],
  );

  if (loading) {
    return (
      <View style={styles.container} accessibilityLabel="Loading metadata">
        <Animated.View
          style={[styles.shimmerSurface, styles.skeletonPill, shimmerStyle]}
        />
        <Animated.View
          style={[styles.shimmerSurface, styles.skeletonPill, shimmerStyle]}
        />
        <Animated.View
          style={[styles.shimmerSurface, styles.skeletonPill, shimmerStyle]}
        />
      </View>
    );
  }

  if (chips.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {chips.map((chip) => (
        <View key={chip.key} style={styles.chip}>
          <Text style={styles.chipText}>{chip.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface_container_highest,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  chipText: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
  },
  shimmerSurface: {
    backgroundColor: colors.surface_container_high,
  },
  skeletonPill: {
    width: spacing.genre_filter_skeleton_width,
    height: spacing.metadata_chip_skeleton_height,
    borderRadius: spacing.sm,
  },
});
