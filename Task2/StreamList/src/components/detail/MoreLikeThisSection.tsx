import { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Movie } from '../../api/types';
import { ContentCard } from '../common/ContentCard';
import { SkeletonCard } from '../common/SkeletonCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const LOADING_SKELETON_KEYS = ['0', '1', '2', '3'] as const;

export type MoreLikeThisSectionProps = {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCardPress: (movieId: number) => void;
};

function SectionHeader() {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>More Like This</Text>
      <Text style={styles.seeAll}>See All</Text>
    </View>
  );
}

export function MoreLikeThisSection({
  movies,
  loading,
  error,
  onRetry,
  onCardPress,
}: MoreLikeThisSectionProps) {
  const renderMovie: ListRenderItem<Movie> = useCallback(
    ({ item }) => (
      <ContentCard
        includeEndMargin={false}
        movie={item}
        onPress={onCardPress}
        width={spacing.content_card_width}
      />
    ),
    [onCardPress],
  );

  const keyExtractor = useCallback((item: Movie) => String(item.id), []);

  if (movies.length === 0 && !loading && error === null) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.root}>
        <SectionHeader />
        <ScrollView
          contentContainerStyle={styles.loadingScrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {LOADING_SKELETON_KEYS.map((key) => (
            <SkeletonCard key={key} width={spacing.content_card_width} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error !== null) {
    return (
      <View style={styles.root}>
        <SectionHeader />
        <View style={styles.errorBlock}>
          <Text style={styles.errorMessage}>
            Could not load recommendations.
          </Text>
          <TouchableOpacity
            accessibilityLabel="Retry loading recommendations"
            accessibilityRole="button"
            onPress={onRetry}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SectionHeader />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={movies}
        horizontal
        keyExtractor={keyExtractor}
        renderItem={renderMovie}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.headline_md,
    color: colors.on_surface,
  },
  seeAll: {
    ...typography.title_sm,
    color: colors.primary_container,
  },
  loadingScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
