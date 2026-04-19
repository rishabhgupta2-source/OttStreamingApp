import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BecauseSavedRow } from '../components/watchlist/BecauseSavedRow';
import { WatchlistCollectionHeader } from '../components/watchlist/WatchlistCollectionHeader';
import { WatchlistEmptyState } from '../components/watchlist/WatchlistEmptyState';
import type { WatchlistFilter } from '../components/watchlist/WatchlistFilterChips';
import { WatchlistFilterChips } from '../components/watchlist/WatchlistFilterChips';
import { WatchlistGrid } from '../components/watchlist/WatchlistGrid';
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
    parent?.navigate('Home', { screen: 'HomeMain' });
  }, [navigation]);

  const onDetailsPress = useCallback(
    (movieId: number) => {
      navigation.navigate('Detail', { movieId });
    },
    [navigation],
  );

  if (!hydrated) {
    return (
      <View style={styles.hydrationRoot}>
        <ActivityIndicator
          color={colors.primary_container}
          size="large"
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
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <WatchlistCollectionHeader itemCount={items.length} />
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
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hydrationRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
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
