export const colors = {
  // Surfaces — layered from deepest to brightest
  surface:                   '#131313',  // Main app background
  surface_container_lowest:  '#0E0E0E',  // Deepest recessed elements
  surface_container_low:     '#1C1B1B',  // Section groupings
  surface_container:         '#232323',  // Mid-level containers
  surface_container_high:    '#2A2A2A',  // Elevated sections
  surface_container_highest: '#353534',  // Cards, interactive elements
  surface_bright:            '#3A3939',  // Hover/pressed states

  // Primary accent (Coral-Red)
  primary:                   '#FFB3AE',  // Gradient start / light tint
  primary_container:         '#FF5351',  // Gradient end / strong accent
  /** Add-to-watchlist CTA gradient (explicit stops; matches design coral-red). */
  watchlist_add_gradient_start: '#FFB3AE',
  watchlist_add_gradient_end:   '#FF5351',
  secondary_container:       '#822625',  // Active chip state (deep red)

  // Text
  on_surface:                '#E5E2E1',  // Primary text — never use pure white
  on_surface_variant:        '#E4BDBA',  // Secondary metadata text

  // Utility
  outline_variant:           'rgba(255,255,255,0.15)', // Ghost borders (accessibility only)
  tab_bar_overlay:           'rgba(35, 35, 35, 0.70)',
  /** Detail top bar: translucent scrim behind back / share (readable on bright hero). */
  detail_nav_action_scrim:   'rgba(19, 19, 19, 0.58)',
  /** Back / share icons on detail scrim — full white for contrast on photos. */
  detail_nav_on_scrim:       '#FFFFFF',

  /** “In Watchlist” CTA: border, icon, label — light coral (lighter than primary_container). */
  watchlist_in_list_accent:  '#FFB3AE',
};

