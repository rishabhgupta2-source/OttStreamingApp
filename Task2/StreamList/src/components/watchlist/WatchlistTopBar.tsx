import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const BRAND_ICON_SIZE = spacing.xl;
const SEARCH_ICON_SIZE = spacing.xl;

export type WatchlistTopBarProps = {
  /** Populated watchlist uses neutral brand wordmark; empty uses coral accent. */
  hasItems: boolean;
};

/**
 * Watchlist header: brand + search affordance + avatar (visual-only right side).
 */
export function WatchlistTopBar({ hasItems }: WatchlistTopBarProps) {
  const brandColor = hasItems ? colors.on_surface : colors.primary_container;

  return (
    <View accessibilityRole="header" style={styles.root}>
      <View style={styles.left}>
        <MaterialIcons
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          name="movie"
          size={BRAND_ICON_SIZE}
          color={colors.primary_container}
          style={styles.brandIcon}
        />
        <Text style={[styles.brand, { color: brandColor }]}>StreamList</Text>
      </View>
      <View style={styles.right}>
        <MaterialIcons
          accessibilityElementsHidden
          color={colors.on_surface_variant}
          importantForAccessibility="no-hide-descendants"
          name="search"
          size={SEARCH_ICON_SIZE}
        />
        <View style={styles.avatar}>
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.avatarGlyph}
          >
            👤
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    marginRight: spacing.xxs,
  },
  brand: {
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.title_lg.fontSize,
    letterSpacing: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: spacing.detail_hero_title_skeleton_height,
    height: spacing.detail_hero_title_skeleton_height,
    borderRadius: spacing.detail_hero_title_skeleton_height / 2,
    marginLeft: spacing.md,
    backgroundColor: colors.surface_container_high,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarGlyph: {
    fontSize: spacing.watchlist_top_bar_avatar_emoji_size,
    lineHeight: spacing.watchlist_top_bar_avatar_emoji_size,
    color: colors.on_surface_variant,
  },
});
