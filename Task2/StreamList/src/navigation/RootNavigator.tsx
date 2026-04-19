import { BlurView } from '@react-native-community/blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing, scrollPaddingBelowFloatingTabBar } from '../theme/spacing';
import { typography } from '../theme/typography';
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
  tabBarBlurRoot: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: spacing.xl,
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
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

function TabBarBackground() {
  return (
    <View style={styles.tabBarBlurRoot}>
      <BlurView
        style={[StyleSheet.absoluteFill, styles.tabBarBlurRoot]}
        blurType="dark"
        blurAmount={20}
        reducedTransparencyFallbackColor={colors.tab_bar_overlay}
      />
      <View style={styles.tabBarTint} pointerEvents="none" />
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        component={HomeScreen}
        name="HomeMain"
        options={{ title: 'Home' }}
      />
      <HomeStack.Screen
        component={DetailScreen}
        name="Detail"
        options={{ title: 'Detail' }}
      />
    </HomeStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={stackScreenOptions}>
      <SearchStack.Screen
        component={SearchScreen}
        name="SearchMain"
        options={{ title: 'Search' }}
      />
      <SearchStack.Screen
        component={DetailScreen}
        name="Detail"
        options={{ title: 'Detail' }}
      />
    </SearchStack.Navigator>
  );
}

function WatchlistStackNavigator() {
  return (
    <WatchlistStack.Navigator screenOptions={stackScreenOptions}>
      <WatchlistStack.Screen
        component={WatchlistScreen}
        name="WatchlistMain"
        options={{ title: 'Watchlist' }}
      />
      <WatchlistStack.Screen
        component={DetailScreen}
        name="Detail"
        options={{ title: 'Detail' }}
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
  /** `items.length` (not store getter) so tab badge re-renders reliably on add/remove. */
  const watchlistCount = useWatchlistStore((state) => state.items.length);

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
        tabBarBackground: TabBarBackground,
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
          tabBarBadge:
            watchlistCount > 0 ? watchlistCount : undefined,
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
