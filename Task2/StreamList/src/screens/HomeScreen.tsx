import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
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

  const [nearVerticalEnd, setNearVerticalEnd] = useState(false);

  const genreMap = genres.data.reduce<Record<number, string>>(
    (map, g) => ({ ...map, [g.id]: g.name }),
    {},
  );

  const heroMovie =
    trending.loading && trending.data.length === 0
      ? null
      : (trending.data[0] ?? null);

  const showHorizontalLoadMoreFooter =
    (trending.hasMore &&
      trending.loading &&
      trending.data.length > 0) ||
    (topRated.hasMore &&
      topRated.loading &&
      topRated.data.length > 0);

  const showVerticalGenreLoadMoreFooter =
    selectedGenreId === null && hasMoreGenres && nearVerticalEnd;

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

  const navigateToDetail = (movieId: number) => {
    navigation.navigate('Detail', { movieId });
  };

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
        genres={genres.data}
        loading={genres.loading}
        onSelectGenre={setSelectedGenre}
        selectedGenreId={selectedGenreId}
      />
      <HeroCard
        movie={heroMovie}
        onDetailsPress={navigateToDetail}
      />
      <ContentRow
        data={trending.data}
        genreMap={genreMap}
        hasMore={trending.hasMore}
        loadMore={trending.loadMore}
        loading={trending.loading}
        onCardPress={navigateToDetail}
        title="Trending Now"
      />
      <ContentRow
        data={topRated.data}
        genreMap={genreMap}
        hasMore={topRated.hasMore}
        loadMore={topRated.loadMore}
        loading={topRated.loading}
        onCardPress={navigateToDetail}
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
