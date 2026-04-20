import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTrending } from '../api/movies';
import { SearchBar } from '../components/search/SearchBar';
import { SearchDefaultView } from '../components/search/SearchDefaultView';
import { SearchResultsGrid } from '../components/search/SearchResultsGrid';
import { usePaginatedMovieList } from '../hooks/usePaginatedMovieList';
import { useSearch } from '../hooks/useSearch';
import type { SearchStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { scrollPaddingBelowFloatingTabBar, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const HEADER_ACTION_SIZE = spacing.xxxl + spacing.xs;
const BRAND_ICON_SIZE = typography.title_lg.fontSize;
const BULB_ICON_SIZE = spacing.xl;

export type SearchScreenProps = NativeStackScreenProps<
  SearchStackParamList,
  'SearchMain'
>;

export function SearchScreen({ navigation }: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    query,
    setQuery,
    runSearchNow,
    retrySearch,
    results,
    loading,
    error,
    totalResults,
    recentSearches,
    clearRecentSearches,
  } = useSearch();

  const showDefaultSearchView = query.trim() === '';

  const trendingForSearch = usePaginatedMovieList('trending_search', (page) =>
    getTrending(page),
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches().catch(() => {});
  }, [clearRecentSearches]);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.keyboardRoot}>
      <View style={styles.root}>
        <View
          style={[
            styles.headerRow,
            { paddingTop: insets.top + spacing.lg },
          ]}
        >
          <View style={styles.headerLeft}>
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name="movie"
              size={BRAND_ICON_SIZE}
              color={colors.primary_container}
            />
            <Text style={styles.brandLabel}>STREAMLIST</Text>
          </View>
          <View style={styles.headerActionCircle}>
            <MaterialIcons
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name="wb-incandescent"
              size={BULB_ICON_SIZE}
              color={colors.primary}
            />
          </View>
        </View>

        <SearchBar onChangeText={setQuery} value={query} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: scrollPaddingBelowFloatingTabBar(
                insets.bottom,
              ),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          {showDefaultSearchView ? (
            <SearchDefaultView
              onCardPress={(movieId) => {
                navigation.navigate('Detail', { movieId });
              }}
              onClearAll={handleClearRecent}
              onGenreSelect={(name) => {
                runSearchNow(name);
              }}
              onSelectSearch={(term) => {
                runSearchNow(term);
              }}
              recentSearches={recentSearches}
              trendingLoading={trendingForSearch.loading}
              trendingMovies={trendingForSearch.data}
            />
          ) : (
            <SearchResultsGrid
              error={error}
              loading={loading}
              onCardPress={(movieId) => {
                navigation.navigate('Detail', { movieId });
              }}
              onRetry={retrySearch}
              query={query}
              results={results}
              totalResults={totalResults}
            />
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  brandLabel: {
    marginLeft: spacing.sm,
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.title_lg.fontSize,
    letterSpacing: spacing.brand_wordmark_letter_spacing,
    color: colors.on_surface,
  },
  headerActionCircle: {
    width: HEADER_ACTION_SIZE,
    height: HEADER_ACTION_SIZE,
    borderRadius: HEADER_ACTION_SIZE / 2,
    backgroundColor: colors.surface_container_high,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
