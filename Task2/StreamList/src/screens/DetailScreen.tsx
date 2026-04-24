import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CastSection } from '../components/detail/CastSection';
import { DetailHero } from '../components/detail/DetailHero';
import { MetadataChips } from '../components/detail/MetadataChips';
import { MoreLikeThisSection } from '../components/detail/MoreLikeThisSection';
import { SynopsisSection } from '../components/detail/SynopsisSection';
import { WatchlistButton } from '../components/detail/WatchlistButton';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { StreamListTabBarBackground } from '../navigation/StreamListTabBarBackground';
import {
  getFloatingTabBarStyle,
  hiddenTabBarStyle,
} from '../navigation/tabBarFloatingStyle';
import type {
  DetailScreenPushNavigation,
  HomeStackParamList,
  SearchStackParamList,
  WatchlistStackParamList,
} from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type DetailScreenProps =
  | NativeStackScreenProps<HomeStackParamList, 'Detail'>
  | NativeStackScreenProps<SearchStackParamList, 'Detail'>
  | NativeStackScreenProps<WatchlistStackParamList, 'Detail'>;

export function DetailScreen({ navigation, route }: DetailScreenProps) {
  const { movieId } = route.params;
  const insets = useSafeAreaInsets();
  const detailBundle = useMovieDetail(movieId);
  const { detail, credits, similar } = detailBundle;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarStyle: hiddenTabBarStyle,
      /** Drop blur layer while Detail is focused — Android can keep a full-screen dim from absoluteFill BlurView. */
      tabBarBackground: () => null,
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: getFloatingTabBarStyle(insets.bottom),
        tabBarBackground: StreamListTabBarBackground,
      });
    };
  }, [navigation, insets.bottom]);

  const genreIds = useMemo(
    () =>
      detail.data === null
        ? []
        : detail.data.genres
            .map((genre) => genre.id)
            .filter(
              (id): id is number => typeof id === 'number' && Number.isFinite(id),
            ),
    [detail.data],
  );

  const canShare = detail.data !== null && !detail.loading;

  const onSharePress = useCallback(async () => {
    const d = detail.data;
    if (d === null) {
      return;
    }
    const title = d.title.trim();
    const url = `https://www.themoviedb.org/movie/${String(movieId)}`;
    const message = title.length > 0 ? `${title}\n${url}` : url;
    try {
      await Share.share({ message });
    } catch {
      /* User dismissed the sheet or share is unavailable. */
    }
  }, [detail.data, movieId]);

  const onSimilarCardPress = useCallback(
    (id: number) => {
      const nav = navigation as DetailScreenPushNavigation;
      nav.push('Detail', { movieId: id });
    },
    [navigation],
  );

  if (detail.error !== null) {
    return (
      <View style={styles.root}>
        <View
          style={[
            styles.navActionBar,
            {
              paddingTop: insets.top + spacing.xs,
            },
          ]}
        >
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
            style={styles.navIconTap}
          >
            <MaterialIcons
              color={colors.detail_nav_on_scrim}
              name="arrow-back"
              size={spacing.xxl}
            />
          </TouchableOpacity>
          <View style={styles.navIconTap} />
        </View>
        <View
          style={[
            styles.errorRoot,
            {
              paddingTop: insets.top + spacing.xxl + spacing.xxxl,
            },
          ]}
        >
          <Text style={styles.errorEmoji}>🎬</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <TouchableOpacity
            accessibilityLabel="Try loading movie again"
            accessibilityRole="button"
            accessibilityState={{ disabled: detail.loading }}
            disabled={detail.loading}
            onPress={detail.refetch}
            style={styles.tryAgainWrap}
          >
            <Text style={styles.tryAgainLabel}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.navActionBar,
          {
            paddingTop: insets.top + spacing.xs,
          },
        ]}
      >
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
          style={styles.navIconTap}
        >
          <MaterialIcons
            color={colors.detail_nav_on_scrim}
            name="arrow-back"
            size={spacing.xxl}
          />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Share movie"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canShare }}
          disabled={!canShare}
          hitSlop={{
            top: spacing.md,
            bottom: spacing.md,
            left: spacing.md,
            right: spacing.md,
          }}
          onPress={onSharePress}
          style={[styles.navIconTap, !canShare ? styles.navIconTapDisabled : null]}
        >
          <MaterialIcons
            color={colors.detail_nav_on_scrim}
            name="share"
            size={spacing.xxl}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DetailHero
          backdropPath={detail.data?.backdrop_path ?? null}
          loading={detail.loading}
          title={detail.data?.title ?? ''}
        />
        <MetadataChips
          genres={detail.data?.genres ?? []}
          loading={detail.loading}
          releaseDate={detail.data?.release_date ?? null}
          runtime={detail.data?.runtime ?? null}
          voteAverage={detail.data?.vote_average ?? null}
        />
        {detail.data !== null ? (
          <WatchlistButton
            key={`watchlist-${String(movieId)}`}
            genreIds={genreIds}
            movieId={movieId}
            posterPath={detail.data.poster_path}
            releaseDate={
              typeof detail.data.release_date === 'string'
                ? detail.data.release_date
                : ''
            }
            title={detail.data.title}
            voteAverage={
              typeof detail.data.vote_average === 'number' &&
              Number.isFinite(detail.data.vote_average)
                ? detail.data.vote_average
                : 0
            }
          />
        ) : null}
        <SynopsisSection
          loading={detail.loading}
          overview={detail.data?.overview ?? ''}
        />
        <CastSection
          cast={credits.data}
          error={credits.error}
          loading={credits.loading}
          onRetry={credits.refetch}
        />
        <MoreLikeThisSection
          error={similar.error}
          loading={similar.loading}
          movies={similar.data}
          onCardPress={onSimilarCardPress}
          onRetry={similar.refetch}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  navActionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    backgroundColor: colors.detail_nav_action_scrim,
  },
  navIconTap: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconTapDisabled: {
    opacity: 0.45,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  errorEmoji: {
    fontSize: spacing.massive,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.headline_md,
    color: colors.on_surface,
    textAlign: 'center',
  },
  tryAgainWrap: {
    marginTop: spacing.lg,
  },
  tryAgainLabel: {
    ...typography.title_sm,
    color: colors.primary_container,
  },
});
