import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContentRow } from '../components/home/ContentRow';
import { GenreFilterStrip } from '../components/home/GenreFilterStrip';
import { HeroCard } from '../components/home/HeroCard';
import { HomeHeader } from '../components/home/HomeHeader';
import { LoadingMoreIndicator } from '../components/home/LoadingMoreIndicator';
import { useHome } from '../hooks/useHome';
import type { HomeStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const TAB_BAR_BASE_HEIGHT =
  spacing.massive + spacing.xl + spacing.sm;

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
    genreMovies,
    selectedGenreId,
    setSelectedGenre,
  } = useHome();

  const genreMap = genres.data.reduce<Record<number, string>>(
    (map, g) => ({ ...map, [g.id]: g.name }),
    {},
  );

  const heroMovie =
    trending.loading && trending.data.length === 0
      ? null
      : (trending.data[0] ?? null);

  const genreRowTitle =
    selectedGenreId === null
      ? 'Popular'
      : (genres.data.find((g) => g.id === selectedGenreId)?.name ?? 'Popular');

  const showLoadingMoreFooter =
    (trending.hasMore &&
      trending.loading &&
      trending.data.length > 0) ||
    (topRated.hasMore &&
      topRated.loading &&
      topRated.data.length > 0) ||
    (genreMovies.hasMore &&
      genreMovies.loading &&
      genreMovies.data.length > 0);

  const navigateToDetail = (movieId: number) => {
    navigation.navigate('Detail', { movieId });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom:
            insets.bottom + TAB_BAR_BASE_HEIGHT + spacing.xxl,
        },
      ]}
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
      <ContentRow
        data={genreMovies.data}
        genreMap={genreMap}
        hasMore={genreMovies.hasMore}
        loadMore={genreMovies.loadMore}
        loading={genreMovies.loading}
        onCardPress={navigateToDetail}
        title={genreRowTitle}
      />
      <LoadingMoreIndicator visible={showLoadingMoreFooter} />
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
