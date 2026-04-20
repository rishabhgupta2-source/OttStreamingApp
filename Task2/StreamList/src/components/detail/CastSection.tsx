import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  FlatList,
  Image,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Cast } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getImageUrl } from '../../utils/image';

const SHIMMER_HALF_CYCLE_MS = 750;
const SHIMMER_MIN_OPACITY = 0.4;
const SHIMMER_MAX_OPACITY = 1;

const SKELETON_PLACEHOLDER_KEYS = ['0', '1', '2', '3', '4'] as const;

export type CastSectionProps = {
  cast: Cast[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function CastSection({
  cast,
  loading,
  error,
  onRetry,
}: CastSectionProps) {
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

  const renderCastItem: ListRenderItem<Cast> = useCallback(
    ({ item }) => {
      const uri = getImageUrl(item.profile_path, 'w185');
      return (
        <View style={styles.castCell}>
          {uri !== null ? (
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={item.name}
              source={{ uri }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.placeholderGlyph}>👤</Text>
            </View>
          )}
          <Text numberOfLines={1} style={styles.actorName}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={styles.characterName}>
            {item.character}
          </Text>
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback(
    (item: Cast) => `${String(item.id)}-${String(item.order)}`,
    [],
  );

  if (loading) {
    return (
      <View style={styles.root}>
        <Text style={styles.sectionLabel}>Cast</Text>
        <ScrollView
          contentContainerStyle={styles.skeletonScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {SKELETON_PLACEHOLDER_KEYS.map((key, index) => (
            <Animated.View
              key={key}
              style={[
                styles.shimmerSurface,
                styles.skeletonCircle,
                shimmerStyle,
                index < SKELETON_PLACEHOLDER_KEYS.length - 1 &&
                  styles.skeletonCircleSpacing,
              ]}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error !== null) {
    return (
      <View style={styles.root}>
        <Text style={styles.sectionLabel}>Cast</Text>
        <View style={styles.errorBlock}>
          <Text style={styles.errorMessage}>Could not load cast.</Text>
          <TouchableOpacity
            accessibilityLabel="Retry loading cast"
            accessibilityRole="button"
            onPress={onRetry}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cast.length === 0) {
    return (
      <Text style={styles.emptyMessage}>
        Cast information unavailable
      </Text>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.sectionLabel}>Cast</Text>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={cast}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={renderCastItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  sectionLabel: {
    ...typography.headline_md,
    color: colors.on_surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  skeletonScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  shimmerSurface: {
    backgroundColor: colors.surface_container_high,
  },
  skeletonCircle: {
    width: spacing.cast_avatar_size,
    height: spacing.cast_avatar_size,
    borderRadius: spacing.cast_avatar_radius,
  },
  skeletonCircleSpacing: {
    marginRight: spacing.md,
  },
  errorBlock: {
    paddingHorizontal: spacing.lg,
  },
  errorMessage: {
    ...typography.body_md,
    color: colors.on_surface_variant,
    marginBottom: spacing.sm,
  },
  retryLabel: {
    ...typography.title_sm,
    color: colors.primary_container,
  },
  emptyMessage: {
    ...typography.body_md,
    color: colors.on_surface_variant,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  castCell: {
    width: spacing.cast_row_item_width,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  avatarImage: {
    width: spacing.cast_avatar_size,
    height: spacing.cast_avatar_size,
    borderRadius: spacing.cast_avatar_radius,
  },
  avatarPlaceholder: {
    width: spacing.cast_avatar_size,
    height: spacing.cast_avatar_size,
    borderRadius: spacing.cast_avatar_radius,
    backgroundColor: colors.surface_container_high,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderGlyph: {
    fontSize: spacing.xxxl,
  },
  actorName: {
    ...typography.label_sm,
    color: colors.on_surface,
    textAlign: 'center',
    marginTop: spacing.xs,
    width: '100%',
  },
  characterName: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
    textAlign: 'center',
    width: '100%',
  },
});
