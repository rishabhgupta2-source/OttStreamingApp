# Home Screen — Feature Breakdown

## Overview
HomeScreen is the main discovery screen. It has 7 sections built from 5 separate component files plus 1 hook and 4 API functions.

## File Structure to Create
src/
├── components/
│   ├── common/
│   │   ├── ContentCard.tsx       ← reused across all screens
│   │   ├── SkeletonCard.tsx      ← reused across all screens
│   │   └── GenreChip.tsx         ← reused across all screens
│   └── home/
│       ├── HomeHeader.tsx        ← Section 1
│       ├── GenreFilterStrip.tsx  ← Section 2
│       ├── HeroCard.tsx          ← Section 3
│       ├── ContentRow.tsx        ← Section 4, 5, 6 (reusable)
│       └── LoadingMoreIndicator.tsx ← Section 7
├── hooks/
│   └── useHome.ts                ← ALL data logic lives here
├── api/
│   └── movies.ts                 ← 4 functions to add
└── screens/
    └── HomeScreen.tsx            ← assembles all components

## Section 1 — HomeHeader
- File: src/components/home/HomeHeader.tsx
- Props: none
- Design: flame icon + "STREAMLIST" text (#FF5351, Manrope-Bold) on left. Bell icon on right.
- Header background: transparent
- No action on bell tap
- Edge case: none

## Section 2 — GenreFilterStrip
- File: src/components/home/GenreFilterStrip.tsx
- Props: genres[], selectedGenreId, onSelectGenre(id|null)
- Data source: useHome hook (genres array from /genre/movie/list)
- Design: horizontal ScrollView, no scroll indicator
- First chip "All" is hardcoded, not from API
- Active chip: #822625 bg, #E5E2E1 text
- Inactive chip: #2A2A2A bg, #E4BDBA text
- NO borders on any chip
- Loading state: show 4 skeleton pill shapes
- Edge case: if genres API fails, still show "All" chip alone

## Section 3 — HeroCard
- File: src/components/home/HeroCard.tsx
- Props: movie (Movie | null), onDetailsPress(id)
- Data source: trendingMovies[0] from useHome hook
- Design: 90% screen width, 16px radius
- Backdrop image w780, gradient overlay bottom 40% (#transparent → #131313)
- "NEW RELEASE" badge: #FF5351 bg, uppercase label-sm text, top-left
- Title: Manrope-ExtraBold 40px, #E5E2E1
- Synopsis: Inter-Regular 14px, #E4BDBA, max 2 lines
- "Watch Now" button: LinearGradient #FFB3AE→#FF5351, play icon ▶
- "Details" button: #353534 bg, navigates to Detail screen
- Loading state: full skeleton matching hero card shape
- Edge cases:
  * backdrop_path null → show #2A2A2A placeholder, still show title
  * overview empty → hide synopsis row entirely
  * movie is null → show skeleton

## Section 4, 5, 6 — ContentRow (reusable)
- File: src/components/home/ContentRow.tsx
- Props: title, data (Movie[]), loading, hasMore, loadMore(), onCardPress(id)
- Design: section title (Manrope-Bold 28px) left + "See All" (#FF5351) right
- Horizontal FlatList of ContentCard components
- Card width: 140px
- onEndReachedThreshold: 0.3
- Loading state: show 4 SkeletonCard components when data is empty and loading
- Empty state: centered text "No content available" in #E4BDBA
- Edge case: if loadMore called when hasMore=false, do nothing

## Section 7 — LoadingMoreIndicator
- File: src/components/home/LoadingMoreIndicator.tsx
- Props: visible (boolean)
- Design: "LOADING MORE CONTENT" uppercase #E4BDBA 12px + small spinner
- Only shown at bottom of screen when more pages loading
- Hidden when all pages loaded

## Common Components Needed
### ContentCard (src/components/common/ContentCard.tsx)
- Props: movie, onPress, width (default 140)
- Aspect ratio 2:3 portrait, 16px radius
- Poster image w342, null → #2A2A2A placeholder
- Title: Manrope-SemiBold 20px below image
- Subtitle: year • genre, Inter-Regular 12px, #E4BDBA
- Rating badge: top-right, #353534 bg, #FF5351 star, hidden if vote_average=0

### SkeletonCard (src/components/common/SkeletonCard.tsx)
- Same 2:3 shape as ContentCard
- #2A2A2A background, shimmer opacity 0.4→1.0 at 1.5s loop

### GenreChip (src/components/common/GenreChip.tsx)
- Props: label, isActive, onPress
- Active: #822625 bg. Inactive: #2A2A2A bg. No borders.

## API Functions Needed (src/api/movies.ts)
1. getTrending(page) → GET /trending/movie/week?page={page}
2. getTopRated(page) → GET /movie/top_rated?page={page}
3. getGenres() → GET /genre/movie/list
4. getDiscoverByGenre(genreId, page) → GET /discover/movie?with_genres={genreId}&page={page}

## useHome Hook (src/hooks/useHome.ts)
- Genre selection: local state ONLY, never Zustand
- 3 independent pagination states (trending, topRated, genre)
- Hero data = trendingMovies[0], no separate API call
- When genre changes: clear array → reset page → fetch fresh

## Build Order (strict — do not mix steps)
Step 1 → API types + functions
Step 2 → useHome hook
Step 3 → SkeletonCard component
Step 4 → GenreChip component
Step 5 → ContentCard component
Step 6 → HomeHeader component
Step 7 → GenreFilterStrip component
Step 8 → HeroCard component
Step 9 → ContentRow component
Step 10 → Assemble HomeScreen.tsx
Step 11 → Wire Detail navigation
Step 12 → Edge case sweep + final test
