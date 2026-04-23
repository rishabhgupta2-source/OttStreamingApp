import { colors } from '../theme/colors';
import { spacing, tabBarStackHeight } from '../theme/spacing';

/**
 * Shared tab bar geometry (used by RootNavigator and DetailScreen cleanup)
 * so `tabBarStyle` always matches after leaving Detail. Full-width bar flush to
 * bottom and horizontal screen edges (not a floating pill).
 */
export function getFloatingTabBarStyle(bottomInset: number) {
  const tabBarHeight = tabBarStackHeight + bottomInset;
  return {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: tabBarHeight,
    paddingTop: spacing.sm,
    paddingBottom: bottomInset,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: colors.transparent,
    borderRadius: 0,
    overflow: 'hidden' as const,
  };
}

/** Hide tab bar while a stack child (e.g. Detail) is focused. */
export const hiddenTabBarStyle = {
  display: 'none' as const,
  height: 0,
  overflow: 'hidden' as const,
};
