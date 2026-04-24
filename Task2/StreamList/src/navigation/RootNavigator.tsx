import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import {
  DetailScreen,
  type DetailScreenProps,
} from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SimilarFromWatchlistScreen } from '../screens/SimilarFromWatchlistScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing, scrollPaddingBelowFloatingTabBar } from '../theme/spacing';
import { typography } from '../theme/typography';
import { StreamListTabBarBackground } from './StreamListTabBarBackground';
import { getFloatingTabBarStyle } from './tabBarFloatingStyle';
import type {
  HomeStackParamList,
  ProfileStackParamList,
  RootTabParamList,
  SearchStackParamList,
  WatchlistStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const WatchlistStack =
  createNativeStackNavigator<WatchlistStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const stackScreenOptions = {
  headerShown: false as const,
  contentStyle: { backgroundColor: colors.surface },
};

/** Detail only: avoids iOS 26+ UIScrollEdgeEffect dimming over the whole screen (native stack + ScrollView). */
const detailScreenOptions = {
  title: 'Detail' as const,
  fullScreenGestureShadowEnabled: false,
  scrollEdgeEffects: {
    top: 'hidden' as const,
    bottom: 'hidden' as const,
    left: 'hidden' as const,
    right: 'hidden' as const,
  },
};

/**
 * Similar list: avoid `detailScreenOptions` here — iOS-only `scrollEdgeEffects`
 * mixed with this screen’s scroll body has caused intermittent blank surfaces on
 * some Android + native-stack builds.
 */
const similarFromWatchlistScreenOptions = {
  ...stackScreenOptions,
  fullScreenGestureShadowEnabled: false,
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  placeholderText: {
    color: colors.on_surface,
    ...typography.title_lg,
  },
});

function PlaceholderScreen({ title }: Readonly<{ title: string }>) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.placeholder,
        {
          paddingBottom: scrollPaddingBelowFloatingTabBar(insets.bottom),
        },
      ]}
    >
      <Text style={styles.placeholderText}>{title}</Text>
    </View>
  );
}

function HomeScreenWithErrorBoundary(
  props: Readonly<NativeStackScreenProps<HomeStackParamList, 'HomeMain'>>,
) {
  return (
    <ScreenErrorBoundary>
      <HomeScreen {...props} />
    </ScreenErrorBoundary>
  );
}

function DetailScreenWithErrorBoundary(props: Readonly<DetailScreenProps>) {
  return (
    <ScreenErrorBoundary>
      <DetailScreen {...props} />
    </ScreenErrorBoundary>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        component={HomeScreenWithErrorBoundary}
        name="HomeMain"
        options={{ title: 'Home' }}
      />
      <HomeStack.Screen
        component={DetailScreenWithErrorBoundary}
        name="Detail"
        options={detailScreenOptions}
      />
    </HomeStack.Navigator>
  );
}

function SearchScreenWithErrorBoundary(
  props: Readonly<NativeStackScreenProps<SearchStackParamList, 'SearchMain'>>,
) {
  return (
    <ScreenErrorBoundary>
      <SearchScreen {...props} />
    </ScreenErrorBoundary>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={stackScreenOptions}>
      <SearchStack.Screen
        component={SearchScreenWithErrorBoundary}
        name="SearchMain"
        options={{ title: 'Search' }}
      />
      <SearchStack.Screen
        component={DetailScreenWithErrorBoundary}
        name="Detail"
        options={detailScreenOptions}
      />
    </SearchStack.Navigator>
  );
}

function WatchlistScreenWithErrorBoundary(
  props: Readonly<
    NativeStackScreenProps<WatchlistStackParamList, 'WatchlistMain'>
  >,
) {
  return (
    <ScreenErrorBoundary>
      <WatchlistScreen {...props} />
    </ScreenErrorBoundary>
  );
}

function SimilarFromWatchlistScreenWithErrorBoundary(
  props: Readonly<
    NativeStackScreenProps<WatchlistStackParamList, 'SimilarFromWatchlist'>
  >,
) {
  return (
    <ScreenErrorBoundary>
      <SimilarFromWatchlistScreen {...props} />
    </ScreenErrorBoundary>
  );
}

function WatchlistStackNavigator() {
  return (
    <WatchlistStack.Navigator screenOptions={stackScreenOptions}>
      <WatchlistStack.Screen
        component={WatchlistScreenWithErrorBoundary}
        name="WatchlistMain"
        options={{ title: 'Watchlist' }}
      />
      <WatchlistStack.Screen
        component={DetailScreenWithErrorBoundary}
        name="Detail"
        options={detailScreenOptions}
      />
      <WatchlistStack.Screen
        component={SimilarFromWatchlistScreenWithErrorBoundary}
        name="SimilarFromWatchlist"
        options={similarFromWatchlistScreenOptions}
      />
    </WatchlistStack.Navigator>
  );
}

function ProfileTabScreen() {
  return <PlaceholderScreen title="Profile" />;
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen
        component={ProfileTabScreen}
        name="ProfileMain"
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

type TabBarMaterialIconName =
  | 'home'
  | 'search'
  | 'bookmark'
  | 'bookmark-border'
  | 'person';

function tabBarIconForRoute(
  routeName: keyof RootTabParamList,
  focused: boolean,
): TabBarMaterialIconName {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Search':
      return 'search';
    case 'Watchlist':
      return focused ? 'bookmark' : 'bookmark-border';
    case 'Profile':
      return 'person';
    default:
      return 'home';
  }
}

export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  /** Badge only after rehydrate; `items.length` updates immediately on add/remove. */
  const { watchlistCount, watchlistHydrated } = useWatchlistStore(
    useShallow((state) => ({
      watchlistCount: state.items.length,
      watchlistHydrated: state.hydrated,
    })),
  );
  const watchlistBadgeValue =
    watchlistHydrated && watchlistCount > 0 ? watchlistCount : undefined;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary_container,
        tabBarInactiveTintColor: colors.on_surface_variant,
        tabBarLabelStyle: {
          ...typography.label_sm,
          textTransform: 'uppercase',
          marginTop: spacing.sm,
        },
        tabBarItemStyle: {
          paddingTop: spacing.xs,
          flex: 1,
        },
        tabBarIconStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarStyle: getFloatingTabBarStyle(insets.bottom),
        tabBarBackground: StreamListTabBarBackground,
        tabBarIcon: ({ color, focused }) => {
          const routeName = route.name as keyof RootTabParamList;
          return (
            <MaterialIcons
              name={tabBarIconForRoute(routeName, focused)}
              size={spacing.xxxl}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{ title: 'Search', tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistStackNavigator}
        options={{
          title: 'Watchlist',
          tabBarLabel: 'Watchlist',
          tabBarBadge: watchlistBadgeValue,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary_container,
            color: colors.surface,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
