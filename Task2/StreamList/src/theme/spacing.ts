export const spacing = {
  /** Hero backdrop / loading skeleton image height */
  hero_backdrop_height: 420,
  /** Hero bottom gradient overlay height */
  hero_gradient_height: 170,
  /** Detail screen hero backdrop (DetailHero) */
  detail_hero_backdrop_height: 220,
  /** Detail hero bottom fade (~40% of backdrop height) */
  detail_hero_gradient_height: 88,
  /** Detail hero loading skeleton under backdrop */
  detail_hero_title_skeleton_height: 36,
  /** Pull title up over hero image bottom */
  hero_title_overlap: -30,
  /** Default portrait card width (home rows, skeletons) */
  content_card_width: 140,
  /** Genre filter strip skeleton pill (loading placeholders) */
  genre_filter_skeleton_width: 60,
  genre_filter_skeleton_height: 34,
  /** Metadata chips row loading pills (MetadataChips) */
  metadata_chip_skeleton_height: 30,
  /** Detail watchlist CTA height (WatchlistButton) */
  watchlist_cta_height: 52,
  /** Synopsis section body skeleton line height (SynopsisSection) */
  synopsis_skeleton_line_height: 14,
  /** Cast row avatar diameter (CastSection) */
  cast_avatar_size: 60,
  cast_avatar_radius: 30,
  /** Cast row cell width (avatar + labels) */
  cast_row_item_width: 80,
  /** Tight vertical gap (e.g. skeleton subtitle offset) */
  xxs: 6,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

/**
 * Inset of floating tab bar from left, right, and bottom screen edges (RootNavigator).
 * Matches mock “pill” that does not touch the bezel.
 */
export const tab_bar_float_edge = spacing.sm;

/**
 * Inner vertical stack for tab bar (icon band + label + padding), before safe-area
 * padding inside the bar. Keep aligned with `tabBarStyle` / icon sizes in RootNavigator.
 */
export const tabBarStackHeight =
  spacing.xxxl +
  spacing.xl +
  spacing.sm +
  spacing.md +
  spacing.lg +
  spacing.sm;

/**
 * ScrollView `paddingBottom` so content clears the floating tab pill and matches
 * Home / Search / other tabs.
 */
export function scrollPaddingBelowFloatingTabBar(
  safeAreaBottomInset: number,
): number {
  return (
    tab_bar_float_edge +
    tabBarStackHeight +
    safeAreaBottomInset +
    spacing.lg
  );
}
