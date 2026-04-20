import type { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type HomeStackParamList = {
  HomeMain: undefined;
  Detail: { movieId: number };
};

export type SearchStackParamList = {
  SearchMain: undefined;
  Detail: { movieId: number };
};

export type WatchlistStackParamList = {
  WatchlistMain: undefined;
  Detail: { movieId: number };
};

/** Params for `Detail` — identical on Home, Search, and Watchlist stacks. */
export type MovieDetailRouteParams = Readonly<HomeStackParamList['Detail']>;

/**
 * `navigation.push('Detail', …)` from `DetailScreen`, where `navigation` is a
 * union of native-stack navigators (TS cannot call `.push` on that union).
 */
export type DetailScreenPushNavigation = {
  push(screen: 'Detail', params: MovieDetailRouteParams): void;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Search: NavigatorScreenParams<SearchStackParamList>;
  Watchlist: NavigatorScreenParams<WatchlistStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackNavigationProp<
  T extends keyof HomeStackParamList = keyof HomeStackParamList,
> = NativeStackNavigationProp<HomeStackParamList, T>;

export type HomeStackRouteProp<T extends keyof HomeStackParamList> = RouteProp<
  HomeStackParamList,
  T
>;

export type SearchStackNavigationProp<
  T extends keyof SearchStackParamList = keyof SearchStackParamList,
> = NativeStackNavigationProp<SearchStackParamList, T>;

export type SearchStackRouteProp<T extends keyof SearchStackParamList> =
  RouteProp<SearchStackParamList, T>;

export type WatchlistStackNavigationProp<
  T extends keyof WatchlistStackParamList = keyof WatchlistStackParamList,
> = NativeStackNavigationProp<WatchlistStackParamList, T>;

export type WatchlistStackRouteProp<T extends keyof WatchlistStackParamList> =
  RouteProp<WatchlistStackParamList, T>;
