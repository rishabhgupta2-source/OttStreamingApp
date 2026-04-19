# Watchlist Screen — Feature Breakdown

## Overview
WatchlistScreen has exactly TWO states based on Zustand store.
State 1 (Populated): items.length > 0
State 2 (Empty): items.length === 0
Both states share the SAME top header (StreamList logo + search + avatar).
The screen reads ALL grid data from Zustand — no API calls for the grid.
Only BecauseSavedRow makes an API call (getSimilarMovies).

## File Structure to Create
src/
├── components/
│   └── watchlist/
│       ├── WatchlistTopBar.tsx        ← Shared top bar (both states)
│       ├── WatchlistCollectionHeader.tsx ← YOUR COLLECTION + My Watchlist title
│       ├── WatchlistFilterChips.tsx   ← All / Movies / Series chips
│       ├── WatchlistGrid.tsx          ← 2-column grid of saved items
│       ├── WatchlistCard.tsx          ← Individual card with × remove button
│       ├── BecauseSavedRow.tsx        ← Similar movies horizontal row
│       └── WatchlistEmptyState.tsx    ← State 2: full empty state UI
└── screens/
    └── WatchlistScreen.tsx            ← Assembles all components

## Build Order (strict — never mix two steps)
Step 1 → Verify getSimilarMovies exists in src/api/movies.ts
Step 2 → Build WatchlistCard component
Step 3 → Build WatchlistTopBar component
Step 4 → Build WatchlistCollectionHeader component
Step 5 → Build WatchlistFilterChips component
Step 6 → Build WatchlistGrid component
Step 7 → Build BecauseSavedRow component
Step 8 → Build WatchlistEmptyState component
Step 9 → Assemble WatchlistScreen.tsx
Step 10 → Wire tab badge + DetailScreen navigation
Step 11 → Edge case sweep
Step 12 → Final sign-off

---

## SHARED — WatchlistTopBar (BOTH states use this)
File: src/components/watchlist/WatchlistTopBar.tsx
Props: none

Design (matches HomeScreen header exactly):
- Row flexDirection row justifyContent space-between alignItems center
- paddingHorizontal 16, paddingTop 16, paddingBottom 8
- Background: transparent

Left side:
- Row with flame icon (Text "🎬" fontSize 20 OR small red View)
- "StreamList" text: Manrope-Bold 20px colors.primary_container letterSpacing 1

Right side:
- "🔍" Text fontSize 20 colors.on_surface_variant (no action)
- Circular avatar: View 36x36 borderRadius 18 bg colors.surface_container_high marginLeft 12 (no action)

---

## STATE 1 — Populated (items.length > 0)

### Section 1 — WatchlistCollectionHeader
File: src/components/watchlist/WatchlistCollectionHeader.tsx
Props: itemCount (number)

Design:
- paddingHorizontal 16, paddingTop 12
- "YOUR COLLECTION" Text: Inter-Regular 12px colors.on_surface_variant uppercase letterSpacing 2
- "My Watchlist" Text: Manrope-ExtraBold 40px colors.on_surface marginTop 2
- "{itemCount} titles" Text: Inter-Regular 12px colors.on_surface_variant marginTop 4

### Section 2 — WatchlistFilterChips
File: src/components/watchlist/WatchlistFilterChips.tsx
Props: activeFilter ('all'|'movies'|'series'), onFilterChange

Design:
- Three chips: "All", "Movies", "Series"
- Reuse GenreChip from src/components/common/GenreChip.tsx
- Active: colors.secondary_container (#822625) bg
- Inactive: colors.surface_container_high bg
- Horizontal row paddingHorizontal 16 paddingVertical 12
- Client-side filtering ONLY — no API re-fetch
- 'movies' filter: shows items where mediaType === 'movie'
- 'series' filter: shows items where mediaType === 'tv'

### Section 3 — WatchlistCard + WatchlistGrid
File: src/components/watchlist/WatchlistCard.tsx
File: src/components/watchlist/WatchlistGrid.tsx

WatchlistCard Props:
{ item: WatchlistItem; onRemove: (id: number) => void; onDetailsPress: (id: number) => void }

WatchlistCard Design:
- Width: (screenWidth / 2) - 24. Height = width * 1.5. borderRadius 16
- Poster image: getImageUrl(item.posterPath, 'w342')
  If posterPath null → View same size bg colors.surface_container_high centered "🎬"
- Rating badge (absolute top 8 right 8):
  bg colors.surface_container_highest borderRadius 8 padding 4px 8px
  "★ " + voteAverage.toFixed(1) Inter-Regular 12px colors.on_surface
  HIDE if voteAverage === 0
- "×" remove button (absolute — positioned below badge, top 40 right 8):
  bg colors.surface_container_highest borderRadius 12 padding 4px 10px
  Text "×" fontSize 16 colors.on_surface
  onPress → onRemove(item.id)
- Title: Manrope-SemiBold 20px colors.on_surface numberOfLines 1 marginTop 8
- Year • Genre: Inter-Regular 12px colors.on_surface_variant marginTop 2
  year = item.releaseDate.split('-')[0]
- "Details" button: full width height 36 borderRadius 8
  bg colors.surface_container_highest marginTop 8
  Centered "Details" Inter-SemiBold 14px colors.on_surface
  onPress → onDetailsPress(item.id)

WatchlistGrid Design:
- FlatList numColumns={2} paddingHorizontal 16
- columnWrapperStyle: gap 12
- ItemSeparatorComponent: View height 16
- Optimistic removal: call removeItem(id) from Zustand immediately
- Empty filter state (filteredItems.length===0 AND items.length>0):
  View paddingTop 40 alignItems center:
  "No {Movies/Series} in your watchlist yet"
  Inter-Regular 14px colors.on_surface_variant textAlign center marginBottom 16
  GenreChip label="Browse All" isActive={false} onPress={onResetFilter}

### Section 4 — BecauseSavedRow
File: src/components/watchlist/BecauseSavedRow.tsx
Props: mostRecentItem (WatchlistItem), onCardPress ((id:number)=>void)

Design:
- Based on items[0] from Zustand (most recently added)
- Header row paddingHorizontal 16 paddingTop 20 paddingBottom 12:
  Left: '"Because you saved " + mostRecentItem.title'
  Manrope-Bold 20px colors.on_surface numberOfLines 1 flex 1
  Right: "View All" Inter-SemiBold 14px colors.primary_container ← DESIGN SAYS "View All"
- Horizontal FlatList ContentCard width=140
- getSimilarMovies(mostRecentItem.id) fetched inside this component
- 4 SkeletonCard while loading
- Return null if similar.length === 0 after loading (hide entire section)
- Return null if API fails (graceful degradation, no error shown)

---

## STATE 2 — Empty (items.length === 0)

### WatchlistEmptyState
File: src/components/watchlist/WatchlistEmptyState.tsx
Props: onBrowseTrending (() => void)

Design:
- Root: ScrollView flex 1 bg colors.surface
- WatchlistTopBar is rendered in WatchlistScreen ABOVE this (not inside)
- Collection header section paddingHorizontal 16 paddingTop 12:
  "YOUR COLLECTION" Inter-Regular 12px colors.on_surface_variant uppercase letterSpacing 2
  "My Watchlist" Manrope-ExtraBold 40px colors.on_surface marginTop 2
  "0 titles" Inter-Regular 12px colors.on_surface_variant marginTop 4
- Centered content (alignItems center paddingHorizontal 32):
  "🔖" Text fontSize 64 colors.secondary_container marginTop 48
  "Your watchlist is empty" Manrope-Bold 28px colors.on_surface textAlign center marginTop 24
  "Save movies and shows you want to watch later and they'll appear here"
  Inter-Regular 14px colors.on_surface_variant textAlign center marginTop 12
- "Browse Trending Now" button marginHorizontal 32 marginTop 32:
  LinearGradient colors={[colors.primary, colors.primary_container]}
  start={{x:0,y:0}} end={{x:1,y:1}} height 52 borderRadius 12
  Centered "Browse Trending Now" Inter-SemiBold 14px colors.on_surface
  onPress → onBrowseTrending()
- "POPULAR RECOMMENDATIONS" label:
  Inter-Regular 12px colors.on_surface_variant uppercase letterSpacing 1
  textAlign center marginTop 40 marginBottom 16
- Horizontal ScrollView with 4 SkeletonCard (width 140) paddingHorizontal 16

---

## TAB BADGE
- Watchlist tab shows numeric badge when count > 0
- Badge color: colors.primary_container (#FF5351)
- Updates reactively from Zustand count
- Add from Detail → badge increments immediately
- Remove from Watchlist → badge decrements immediately

## Edge Cases Summary (all required)
1. Empty watchlist → WatchlistEmptyState with "Browse Trending Now" button
2. "Movies" filter but only series saved → "No Movies in your watchlist yet" + Browse All chip
3. "Series" filter but only movies saved → "No Series in your watchlist yet" + Browse All chip
4. × remove → optimistic (Zustand immediate), snap back + Alert if persist fails
5. "Because you saved" similar empty → return null (hide entire section)
6. Tab badge reactive from any screen
7. hydrated false → show skeleton, never stale state
8. posterPath null → placeholder handled by WatchlistCard
9. Items persist across app restarts via Zustand persist + AsyncStorage
