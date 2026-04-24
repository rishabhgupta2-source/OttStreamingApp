import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContentRow } from '../components/home/ContentRow';
import { GenreFilterStrip } from '../components/home/GenreFilterStrip';
import { HeroCard } from '../components/home/HeroCard';
import { HomeGenreDiscoverSection } from '../components/home/HomeGenreDiscoverSection';
import { HomeHeader } from '../components/home/HomeHeader';
import { LoadingMoreIndicator } from '../components/home/LoadingMoreIndicator';
import { useHome } from '../hooks/useHome';
import type { HomeStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { scrollPaddingBelowFloatingTabBar, spacing } from '../theme/spacing';

const GENRE_VERTICAL_LOAD_THRESHOLD = spacing.xxl * 8;

export type HomeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'HomeMain'
>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [nearVerticalEnd, setNearVerticalEnd] = useState(false);
  const {
    genres,
    trending,
    topRated,
    genreDiscoverSections,
    hasMoreGenres,
    loadMoreGenres,
    selectedGenreId,
    setSelectedGenre,
  } = useHome();

  const genreMap = useMemo(
    () =>
      genres.data.reduce<Record<number, string>>((map, g) => {
        if (typeof g.id === 'number' && Number.isFinite(g.id)) {
          return { ...map, [g.id]: g.name };
        }
        return map;
      }, {}),
    [genres.data],
  );

  const heroMovie =
    trending.loading &&
    trending.data.length === 0 &&
    trending.error === null
      ? null
      : (trending.data[0] ?? null);

  const heroLoading =
    trending.loading &&
    trending.data.length === 0 &&
    trending.error === null;

  const showHorizontalLoadMoreFooter =
    (trending.hasMore &&
      trending.loading &&
      trending.data.length > 0) ||
    (topRated.hasMore &&
      topRated.loading &&
      topRated.data.length > 0);

  /** Near bottom on "All" while more genre rows exist — genre append is sync; indicator reflects scroll + remaining work. */
  const showVerticalGenreLoadMoreFooter =
    selectedGenreId === null &&
    nearVerticalEnd &&
    hasMoreGenres &&
    genres.data.length > 0 &&
    genres.error === null &&
    !genres.loading;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const nearBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - GENRE_VERTICAL_LOAD_THRESHOLD;
      setNearVerticalEnd(nearBottom);
      if (nearBottom && hasMoreGenres) {
        loadMoreGenres();
      }
    },
    [hasMoreGenres, loadMoreGenres],
  );

  const navigateToDetail = useCallback(
    (movieId: number) => {
      navigation.navigate('Detail', { movieId });
    },
    [navigation],
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: scrollPaddingBelowFloatingTabBar(insets.bottom),
        },
      ]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      <HomeHeader />
      <GenreFilterStrip
        error={genres.error}
        genres={genres.data}
        loading={genres.loading}
        onRetry={genres.refetch}
        onSelectGenre={setSelectedGenre}
        selectedGenreId={selectedGenreId}
      />
      <HeroCard
        loadErrorMessage={trending.error}
        loading={heroLoading}
        movie={heroMovie}
        onDetailsPress={navigateToDetail}
        onRetryLoad={trending.refetch}
      />
      {trending.data.length > 0 || trending.loading ? (
        <ContentRow
          data={trending.data}
          error={trending.data.length > 0 ? trending.error : null}
          genreMap={genreMap}
          hasMore={trending.hasMore}
          loadMore={trending.loadMore}
          loading={trending.loading}
          onCardPress={navigateToDetail}
          onRetry={trending.data.length > 0 ? trending.refetch : undefined}
          title="Trending Now"
        />
      ) : null}
      <ContentRow
        data={topRated.data}
        error={topRated.error}
        genreMap={genreMap}
        hasMore={topRated.hasMore}
        loadMore={topRated.loadMore}
        loading={topRated.loading}
        onCardPress={navigateToDetail}
        onRetry={topRated.refetch}
        title="Top Rated"
      />
      {genreDiscoverSections.map((section) => (
        <HomeGenreDiscoverSection
          genreId={section.genreId}
          genreMap={genreMap}
          key={section.genreId}
          onCardPress={navigateToDetail}
          title={section.title}
        />
      ))}
      <LoadingMoreIndicator
        visible={
          showHorizontalLoadMoreFooter || showVerticalGenreLoadMoreFooter
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
