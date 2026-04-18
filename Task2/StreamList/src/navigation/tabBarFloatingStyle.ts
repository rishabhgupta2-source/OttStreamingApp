import {
  spacing,
  tab_bar_float_edge,
  tabBarStackHeight,
} from '../theme/spacing';

/**
 * Shared floating tab bar geometry (used by RootNavigator and DetailScreen cleanup)
 * so `tabBarStyle` always matches after leaving Detail.
 */
export function getFloatingTabBarStyle(bottomInset: number) {
  const tabBarHeight = tabBarStackHeight + bottomInset;
  return {
    position: 'absolute' as const,
    left: tab_bar_float_edge,
    right: tab_bar_float_edge,
    bottom: tab_bar_float_edge,
    height: tabBarHeight,
    paddingTop: spacing.sm,
    paddingBottom: bottomInset,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent' as const,
    borderRadius: spacing.xl,
    overflow: 'hidden' as const,
  };
}

/** Hide tab bar while a stack child (e.g. Detail) is focused. */
export const hiddenTabBarStyle = {
  display: 'none' as const,
  height: 0,
  overflow: 'hidden' as const,
};
