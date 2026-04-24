import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;

export type SynopsisSectionProps = {
  overview: string;
  loading: boolean;
};

export function SynopsisSection({
  overview,
  loading,
}: SynopsisSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const opacity = useRef(new Animated.Value(SHIMMER_MIN_OPACITY)).current;

  useEffect(() => {
    setExpanded(false);
    setShowReadMore(false);
  }, [overview]);

  useEffect(() => {
    if (loading) {
      setExpanded(false);
    }
  }, [loading]);

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

  const isEmpty = overview.trim() === '';

  const onReadMore = useCallback(() => {
    setExpanded(true);
  }, []);

  const onShowLess = useCallback(() => {
    setExpanded(false);
  }, []);

  const onMeasureTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (expanded) {
        return;
      }
      setShowReadMore(e.nativeEvent.lines.length > 3);
    },
    [expanded],
  );

  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={styles.label}>Synopsis</Text>
        <View style={styles.skeletonBlock}>
          <Animated.View
            style={[
              styles.shimmerSurface,
              styles.skeletonLineFull,
              shimmerStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.shimmerSurface,
              styles.skeletonLineFull,
              shimmerStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.shimmerSurface,
              styles.skeletonLineShort,
              shimmerStyle,
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Synopsis</Text>
      {isEmpty ? (
        <Text style={styles.emptyBody}>No synopsis available.</Text>
      ) : (
        <View style={styles.bodyBlock}>
          {!expanded ? (
            <Text
              importantForAccessibility="no"
              onTextLayout={onMeasureTextLayout}
              pointerEvents="none"
              style={[styles.body, styles.bodyMeasure]}
            >
              {overview}
            </Text>
          ) : null}
          <Text
            style={styles.body}
            numberOfLines={expanded ? undefined : 3}
          >
            {overview}
          </Text>
          {expanded ? (
            <Pressable
              accessibilityLabel="Show less synopsis"
              accessibilityRole="button"
              onPress={onShowLess}
              style={styles.togglePressable}
            >
              <Text style={styles.toggleText}>Show less</Text>
            </Pressable>
          ) : showReadMore ? (
            <Pressable
              accessibilityLabel="Read more synopsis"
              accessibilityRole="button"
              onPress={onReadMore}
              style={styles.togglePressable}
            >
              <Text style={styles.toggleText}>Read more</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  bodyBlock: {
    position: 'relative',
    width: '100%',
  },
  bodyMeasure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
  },
  label: {
    ...typography.headline_md,
    color: colors.on_surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  body: {
    ...typography.body_md,
    color: colors.on_surface,
    paddingHorizontal: spacing.lg,
  },
  emptyBody: {
    ...typography.body_md,
    color: colors.on_surface_variant,
    paddingHorizontal: spacing.lg,
  },
  togglePressable: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  toggleText: {
    ...typography.title_sm,
    color: colors.primary_container,
  },
  skeletonBlock: {
    paddingHorizontal: spacing.lg,
  },
  shimmerSurface: {
    backgroundColor: colors.surface_container_high,
  },
  skeletonLineFull: {
    width: '100%',
    height: spacing.synopsis_skeleton_line_height,
    borderRadius: spacing.xs,
    marginBottom: spacing.xxs,
  },
  skeletonLineShort: {
    alignSelf: 'flex-start',
    width: '60%',
    height: spacing.synopsis_skeleton_line_height,
    borderRadius: spacing.xs,
    marginBottom: spacing.xxs,
  },
});
