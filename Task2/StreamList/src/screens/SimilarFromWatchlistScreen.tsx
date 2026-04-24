import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSimilarMovies } from '../api/movies';
import type { Movie } from '../api/types';
import { ContentCard } from '../components/common/ContentCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import type { WatchlistStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { scrollPaddingBelowFloatingTabBar, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const SKELETON_KEYS = ['0', '1', '2', '3', '4', '5'] as const;

export type SimilarFromWatchlistScreenProps = NativeStackScreenProps<
  WatchlistStackParamList,
  'SimilarFromWatchlist'
>;

function dedupeMoviesById(movies: Movie[]): Movie[] {
  const seen = new Set<number>();
  const out: Movie[] = [];
  for (const m of movies) {
    if (seen.has(m.id)) {
      continue;
    }
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

/** Two-column rows without `FlatList` + `numColumns` (avoids Android + native-stack blank views). */
function chunkIntoPairs<T>(items: readonly T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2) as T[]);
  }
  return rows;
}

export function SimilarFromWatchlistScreen({
  navigation,
  route,
}: SimilarFromWatchlistScreenProps) {
  const { movieId, sourceTitle } = route.params;
  const sourceTitleSafe =
    typeof sourceTitle === 'string' ? sourceTitle.trim() : '';
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const cardWidth = useMemo(() => {
    const raw = windowWidth / 2 - spacing.xxl;
    return raw > 0 ? raw : spacing.content_card_width;
  }, [windowWidth]);

  const skeletonRows = useMemo(() => chunkIntoPairs([...SKELETON_KEYS]), []);
  const movieRows = useMemo(() => chunkIntoPairs(movies), [movies]);

  const idValid =
    typeof movieId === 'number' &&
    Number.isFinite(movieId) &&
    movieId > 0 &&
    Math.floor(movieId) === movieId;

  useFocusEffect(
    useCallback(() => {
      if (!idValid) {
        setLoading(false);
        setMovies([]);
        setError(
          'This title could not be opened. Go back and try again from your watchlist.',
        );
        return undefined;
      }

      let cancelled = false;
      setLoading(true);
      setError(null);
      getSimilarMovies(movieId)
        .then((res) => {
          if (cancelled) {
            return;
          }
          const rows = Array.isArray(res.results) ? res.results : [];
          setMovies(dedupeMoviesById(rows));
        })
        .catch(() => {
          if (!cancelled) {
            setMovies([]);
            setError(
              'Could not load similar titles. Check your connection and try again.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [idValid, movieId, refetchToken]),
  );

  const onCardPress = useCallback(
    (id: number) => {
      navigation.navigate('Detail', { movieId: id });
    },
    [navigation],
  );

  const bottomPad = scrollPaddingBelowFloatingTabBar(insets.bottom);

  const scrollContentStyle = useMemo(
    () => [styles.listContent, { paddingBottom: bottomPad, flexGrow: 1 }],
    [bottomPad],
  );

  return (
    <View
      collapsable={false}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <View style={styles.navBar}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{
            top: spacing.md,
            bottom: spacing.md,
            left: spacing.md,
            right: spacing.md,
          }}
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <MaterialIcons
            color={colors.on_surface}
            name="arrow-back"
            size={spacing.xxl}
          />
        </TouchableOpacity>
        <View style={styles.navTitles}>
          <Text numberOfLines={1} style={styles.navTitle}>
            Similar titles
          </Text>
          {sourceTitleSafe.length > 0 ? (
            <Text numberOfLines={1} style={styles.navSubtitle}>
              {`Because you saved ${sourceTitleSafe}`}
            </Text>
          ) : null}
        </View>
      </View>

      <View collapsable={false} style={styles.body}>
        {loading ? (
          <ScrollView
            contentContainerStyle={scrollContentStyle}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            style={styles.listFlex}
          >
            {skeletonRows.map((row, rowIndex) => (
              <View
                key={`similar-skel-row-${String(rowIndex)}`}
                style={styles.gridRow}
              >
                {row.map((key) => (
                  <View key={key} style={styles.gridCellWrap}>
                    <SkeletonCard
                      showCaptionSkeletons={false}
                      width={cardWidth}
                    />
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : null}

        {!loading && error !== null ? (
          <View style={styles.errorRoot}>
            <Text style={[typography.body_md, styles.errorMessage]}>{error}</Text>
            {idValid ? (
              <Pressable
                accessibilityLabel="Retry loading similar titles"
                accessibilityRole="button"
                hitSlop={spacing.sm}
                onPress={() => {
                  setRefetchToken((t) => t + 1);
                }}
                style={styles.retryPressable}
              >
                <Text style={[typography.title_sm, styles.retryLabel]}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!loading && error === null && movies.length === 0 ? (
          <View style={styles.emptyRoot}>
            <Text style={[typography.body_md, styles.emptyText]}>
              No similar titles were found for this pick.
            </Text>
          </View>
        ) : null}

        {!loading && error === null && movies.length > 0 ? (
          <ScrollView
            contentContainerStyle={scrollContentStyle}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            style={styles.listFlex}
          >
            {movieRows.map((row, rowIndex) => (
              <View
                key={`similar-movie-row-${String(rowIndex)}`}
                style={styles.gridRow}
              >
                {row.map((item) => (
                  <View key={item.id} style={styles.gridCellWrap}>
                    <ContentCard
                      includeBottomSpacing
                      includeEndMargin={false}
                      movie={item}
                      onPress={onCardPress}
                      width={cardWidth}
                    />
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  navTitles: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  navTitle: {
    ...typography.title_lg,
    color: colors.on_surface,
  },
  navSubtitle: {
    ...typography.label_sm,
    marginTop: spacing.xs / 2,
    color: colors.on_surface_variant,
  },
  /** Fills space below the nav bar so the scroll body gets a bounded height. */
  body: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: colors.surface,
  },
  listFlex: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingTop: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  gridCellWrap: {
    marginBottom: spacing.lg,
  },
  errorRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorMessage: {
    color: colors.on_surface,
    textAlign: 'center',
  },
  retryPressable: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryLabel: {
    color: colors.primary_container,
    textTransform: 'uppercase',
  },
  emptyRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
});
