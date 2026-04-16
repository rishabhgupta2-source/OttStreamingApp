import { BlurView } from '@react-native-community/blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type {
  HomeStackParamList,
  RootTabParamList,
  SearchStackParamList,
  WatchlistStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const WatchlistStack =
  createNativeStackNavigator<WatchlistStackParamList>();

const TAB_BAR_BASE_HEIGHT =
  spacing.massive + spacing.xl + spacing.sm;

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
    paddingBottom: TAB_BAR_BASE_HEIGHT + spacing.xxl,
  },
  placeholderText: {
    color: colors.on_surface,
    ...typography.title_lg,
  },
  tabBarBlurRoot: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: spacing.lg,
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
});

function PlaceholderScreen({ title }: Readonly<{ title: string }>) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{title}</Text>
    </View>
  );
}

function StackDetailScreen({
  movieId,
}: Readonly<{ movieId: number }>) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Detail</Text>
      <Text style={styles.placeholderText}>{String(movieId)}</Text>
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
      <SearchStack.Screen name="SearchMain" options={{ title: 'Search' }}>
        {() => <PlaceholderScreen title="SearchMain" />}
      </SearchStack.Screen>
      <SearchStack.Screen name="Detail" options={{ title: 'Detail' }}>
        {(props) => (
          <StackDetailScreen movieId={props.route.params.movieId} />
        )}
      </SearchStack.Screen>
    </SearchStack.Navigator>
  );
}

function WatchlistStackNavigator() {
  return (
    <WatchlistStack.Navigator screenOptions={stackScreenOptions}>
      <WatchlistStack.Screen
        name="WatchlistMain"
        options={{ title: 'Watchlist' }}
      >
        {() => <PlaceholderScreen title="WatchlistMain" />}
      </WatchlistStack.Screen>
      <WatchlistStack.Screen name="Detail" options={{ title: 'Detail' }}>
        {(props) => (
          <StackDetailScreen movieId={props.route.params.movieId} />
        )}
      </WatchlistStack.Screen>
    </WatchlistStack.Navigator>
  );
}

function ProfileTabScreen() {
  return <PlaceholderScreen title="Profile" />;
}

type TabBarMaterialIconName =
  | 'home'
  | 'search'
  | 'favorite'
  | 'favorite-border'
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
      return focused ? 'favorite' : 'favorite-border';
    case 'Profile':
      return 'person';
    default:
      return 'home';
  }
}

export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  const watchlistCount = useWatchlistStore((s) => s.count);
  const watchlistHydrated = useWatchlistStore((s) => s.hydrated);

  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarLabel: () => null,
        tabBarActiveTintColor: colors.primary_container,
        tabBarInactiveTintColor: colors.on_surface_variant,
        tabBarStyle: {
          position: 'absolute',
          left: spacing.sm,
          right: spacing.sm,
          bottom: spacing.sm,
          height: tabBarHeight,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          borderRadius: spacing.lg,
          overflow: 'hidden',
        },
        tabBarBackground: TabBarBackground,
        tabBarIcon: ({ color, size, focused }) => {
          const routeName = route.name as keyof RootTabParamList;
          return (
            <MaterialIcons
              name={tabBarIconForRoute(routeName, focused)}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistStackNavigator}
        options={{
          title: 'Watchlist',
          tabBarBadge:
            watchlistHydrated && watchlistCount > 0
              ? watchlistCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary_container,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTabScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
