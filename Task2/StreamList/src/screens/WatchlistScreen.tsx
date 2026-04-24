import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BecauseSavedRow } from '../components/watchlist/BecauseSavedRow';
import { WatchlistCollectionHeader } from '../components/watchlist/WatchlistCollectionHeader';
import { WatchlistEmptyState } from '../components/watchlist/WatchlistEmptyState';
import type { WatchlistFilter } from '../components/watchlist/WatchlistFilterChips';
import { WatchlistFilterChips } from '../components/watchlist/WatchlistFilterChips';
import {
  getFilteredWatchlistItems,
  WatchlistGrid,
} from '../components/watchlist/WatchlistGrid';
import { WatchlistHydrationSkeleton } from '../components/watchlist/WatchlistHydrationSkeleton';
import { WatchlistTopBar } from '../components/watchlist/WatchlistTopBar';
import type {
  RootTabParamList,
  WatchlistStackParamList,
} from '../navigation/types';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { scrollPaddingBelowFloatingTabBar } from '../theme/spacing';

export type WatchlistScreenProps = NativeStackScreenProps<
  WatchlistStackParamList,
  'WatchlistMain'
>;

export function WatchlistScreen({ navigation }: WatchlistScreenProps) {
  const insets = useSafeAreaInsets();
  const { items, hydrated } = useWatchlistStore();
  const [activeFilter, setActiveFilter] = useState<WatchlistFilter>('all');

  useEffect(() => {
    if (items.length === 0) {
      setActiveFilter('all');
    }
  }, [items.length]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const onBrowseTrending = useCallback(() => {
    const parent = navigation.getParent<
      BottomTabNavigationProp<RootTabParamList>
    >();
    parent?.dispatch(
      CommonActions.navigate({
        name: 'Home',
        params: { screen: 'HomeMain' },
      }),
    );
  }, [navigation]);

  const onDetailsPress = useCallback(
    (movieId: number) => {
      navigation.navigate('Detail', { movieId });
    },
    [navigation],
  );

  const displayCount = useMemo(
    () => getFilteredWatchlistItems(items, activeFilter).length,
    [items, activeFilter],
  );

  const onBecauseSavedViewAll = useCallback(() => {
    const last = items[items.length - 1];
    if (last === undefined || last.mediaType !== 'movie') {
      return;
    }
    navigation.navigate('SimilarFromWatchlist', {
      movieId: last.id,
      sourceTitle: last.title,
    });
  }, [items, navigation]);

  if (!hydrated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <WatchlistTopBar hasItems={false} />
        <WatchlistHydrationSkeleton
          paddingBottom={scrollPaddingBelowFloatingTabBar(insets.bottom)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <WatchlistTopBar hasItems={items.length > 0} />
      {items.length === 0 ? (
        <WatchlistEmptyState onBrowseTrending={onBrowseTrending} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: scrollPaddingBelowFloatingTabBar(insets.bottom),
            },
          ]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <WatchlistCollectionHeader itemCount={displayCount} />
          <WatchlistFilterChips
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <WatchlistGrid
            activeFilter={activeFilter}
            items={items}
            onDetailsPress={onDetailsPress}
            onResetFilter={() => {
              setActiveFilter('all');
            }}
          />
          <BecauseSavedRow
            mostRecentItem={items[items.length - 1]}
            onCardPress={onDetailsPress}
            onViewAllPress={onBecauseSavedViewAll}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
});
