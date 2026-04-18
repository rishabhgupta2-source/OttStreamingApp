# Detail Screen — Feature Breakdown

## Overview
DetailScreen is a stack screen pushed over the bottom tabs.
It makes THREE parallel API calls simultaneously using Promise.allSettled.
Each section has its own independent loading skeleton and error state.
A failed cast call must NOT affect the movie details section.

## File Structure to Create
src/
├── components/
│   └── detail/
│       ├── DetailHero.tsx           ← Section 1: backdrop + title
│       ├── MetadataChips.tsx        ← Section 2: year, rating, genre, runtime chips
│       ├── WatchlistButton.tsx      ← Section 3: add/remove watchlist CTA
│       ├── SynopsisSection.tsx      ← Section 4: overview with read more toggle
│       ├── CastSection.tsx          ← Section 5: horizontal cast avatars
│       └── MoreLikeThisSection.tsx  ← Section 6: similar movies row
├── hooks/
│   └── useMovieDetail.ts            ← ALL detail logic, Promise.allSettled
├── api/
│   └── movies.ts                    ← add 3 new functions here
└── screens/
    └── DetailScreen.tsx             ← assembles all components

## Build Order (strict)
Step 1 → Add 3 API functions to src/api/movies.ts
Step 2 → Add MovieDetail, Credits, Cast interfaces to src/api/types.ts
Step 3 → Build useMovieDetail hook with Promise.allSettled
Step 4 → Build DetailHero component
Step 5 → Build MetadataChips component
Step 6 → Build WatchlistButton component
Step 7 → Build SynopsisSection component
Step 8 → Build CastSection component
Step 9 → Build MoreLikeThisSection component
Step 10 → Assemble DetailScreen.tsx
Step 11 → Edge case sweep
Step 12 → Final sign-off

## NAVIGATION
- No bottom tab bar on this screen
- Back arrow top-left: navigation.goBack()
- Share icon top-right: placeholder, no action
- Accessed from HomeScreen, SearchScreen, WatchlistScreen

## SECTION 1 — DetailHero
File: src/components/detail/DetailHero.tsx
Props: backdropPath (string|null), title (string), loading (boolean)

Design:
- Full-width backdrop image, height 220px
- Image size: w780 from src/utils/image.ts
- If backdropPath is null → View height 220px bg colors.surface_container_high with centered "🎬" text
- Bottom 40% LinearGradient: transparent → colors.surface (#131313)
- Title below image: Manrope-ExtraBold 40px, colors.on_surface
- Loading state: SkeletonCard matching full width, height 220px + skeleton title line below

Edge cases:
- backdropPath null → placeholder with icon, title still renders
- title empty → show "Unknown Title"

## SECTION 2 — MetadataChips
File: src/components/detail/MetadataChips.tsx
Props: year (string|null), voteAverage (number|null), genre (string|null), runtime (number|null), loading (boolean)

Design:
- Non-scrollable horizontal row, flexWrap wrap, paddingHorizontal 16, paddingVertical 12
- Each chip: bg colors.surface_container_highest (#353534), borderRadius 8, paddingHorizontal 12, paddingVertical 6
- Text: Inter-Regular 12px, colors.on_surface_variant
- Chips shown: Year | "★ {rating}" | Genre | "{runtime} min"

CRITICAL edge cases (all required by spec):
- runtime is null OR 0 → omit runtime chip entirely
- voteAverage is 0 OR null → omit rating chip entirely
- genre is null → omit genre chip entirely
- year is null → omit year chip entirely
- Loading state: 3 skeleton pill shapes

## SECTION 3 — WatchlistButton
File: src/components/detail/WatchlistButton.tsx
Props: movieId (number), movie (WatchlistItem data), isInWatchlist (boolean), hydrated (boolean), onToggle ()

Design — NOT added state:
- Full width, height 52px, borderRadius 12
- LinearGradient colors.primary → colors.primary_container (#FFB3AE → #FF5351)
- "🔖 Add to Watchlist" Inter-SemiBold 14px, colors.on_surface
- start {x:0,y:0} end {x:1,y:1}

Design — ADDED state:
- Full width, height 52px, borderRadius 12
- bg colors.surface_container_highest (#353534)
- borderWidth 1, borderColor colors.outline_variant
- "🔖 In Watchlist" Inter-SemiBold 14px, colors.primary_container

Toggle behaviour:
- OPTIMISTIC: update UI immediately before AsyncStorage confirms
- Do NOT wait for Zustand persist to complete before showing new state
- If hydrated is false → show skeleton, never show stale state

## SECTION 4 — SynopsisSection
File: src/components/detail/SynopsisSection.tsx
Props: overview (string), loading (boolean)

Design:
- "Synopsis" label: Manrope-Bold 28px, colors.on_surface, paddingHorizontal 16, paddingTop 20
- Body text: Inter-Regular 14px, colors.on_surface, paddingHorizontal 16
- Default: numberOfLines={3} truncated
- "Read more" link below: Inter-SemiBold 14px, colors.primary_container
- Expanded: show full text, "Show less" link
- Toggle using local useState (not Zustand)
- Loading state: 3 skeleton text lines
- Edge case: if overview is empty string → show "No synopsis available." in colors.on_surface_variant

## SECTION 5 — CastSection
File: src/components/detail/CastSection.tsx
Props: cast (Cast[]), loading (boolean), error (string|null), onRetry ()

Design:
- "Cast" label: Manrope-Bold 28px, paddingHorizontal 16, paddingTop 20
- Horizontal FlatList of cast avatars
- Each avatar: circular image 60px diameter, borderRadius 30
  - Image size: w185 from src/utils/image.ts
  - If profile_path null → circular View bg colors.surface_container_high with "👤"
  - Actor name below: Inter-Regular 12px colors.on_surface, numberOfLines 1, textAlign center
  - Character name below: Inter-Regular 12px colors.on_surface_variant, numberOfLines 1, textAlign center
  - Width 80px per item, marginRight 12
- Only show first 10 cast members (filter by order field, take slice 0-9)
- Loading state: 5 circular SkeletonCard shapes (60px diameter)

CRITICAL edge cases:
- cast array empty → show "Cast information unavailable" in colors.on_surface_variant, do NOT show empty section header
- API call fails → show section-level error: "Could not load cast." + "Retry" button in colors.primary_container
- Retry button calls onRetry() which re-triggers ONLY the credits API call

## SECTION 6 — MoreLikeThisSection
File: src/components/detail/MoreLikeThisSection.tsx
Props: movies (Movie[]), loading (boolean), error (string|null), onRetry ()

Design:
- "More Like This" label left + "See All" right (colors.primary_container), paddingHorizontal 16, paddingTop 20
- Horizontal FlatList of ContentCard components (reuse from Day 2)
- Card width: 140px
- Loading state: 4 SkeletonCard components

CRITICAL edge cases:
- movies array empty → hide ENTIRE section including header (return null)
- API call fails → show section-level error message + "Retry" button
- Retry calls onRetry() which re-triggers ONLY the similar API call

## API Functions Needed (src/api/movies.ts — add 3 new)
1. getMovieDetail(id: number) → GET /movie/{id}
2. getMovieCredits(id: number) → GET /movie/{id}/credits
3. getSimilarMovies(id: number) → GET /movie/{id}/similar

## New TypeScript Interfaces Needed (src/api/types.ts — add these)
interface MovieDetail {
  id: number;
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genres: Genre[];        ← NOTE: array of Genre objects, NOT genre_ids
  runtime: number | null;
  overview: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;          ← use this to filter top-billed cast
}

interface Credits {
  id: number;
  cast: Cast[];
}

## useMovieDetail Hook Contract (src/hooks/useMovieDetail.ts)

CRITICAL REQUIREMENT — Promise.allSettled:
All three API calls MUST fire simultaneously.
Never chain them sequentially (.then → .then → .then).

Pattern to use:
const [detailResult, creditsResult, similarResult] = await Promise.allSettled([
  getMovieDetail(movieId),
  getMovieCredits(movieId),
  getSimilarMovies(movieId),
]);

Each result has status: 'fulfilled' | 'rejected'
Handle each independently — a rejected credits call must NOT affect details.

Return shape:
{
  detail: { data: MovieDetail|null, loading: boolean, error: string|null, refetch: ()=>void }
  credits: { data: Cast[], loading: boolean, error: string|null, refetch: ()=>void }
  similar: { data: Movie[], loading: boolean, error: string|null, refetch: ()=>void }
}

Each section refetch re-triggers ONLY that section's API call (not all three).

## Watchlist Integration
- Import useWatchlistStore from src/store/watchlistStore.ts
- Read: isInWatchlist(movieId), hydrated
- Write: addItem(WatchlistItem), removeItem(movieId)
- WatchlistItem shape must match the interface in watchlistStore.ts exactly
- Only render WatchlistButton after hydrated === true

## Edge Cases Summary (ALL required by spec)
1. backdrop_path null → placeholder View + icon, title still shows
2. poster_path null → already handled by ContentCard
3. runtime null or 0 → omit runtime chip
4. vote_average 0 → omit rating chip
5. cast array empty → "Cast information unavailable" text, no header
6. similar movies empty → hide entire More Like This section + header
7. credits API fails → cast section shows error + retry (detail section unaffected)
8. similar API fails → similar section shows error + retry (detail section unaffected)
9. detail API fails → show full screen error with retry
10. Watchlist button correct on re-entry: add → go back → return → shows "In Watchlist"
11. hydrated false → show skeleton for watchlist button, never stale state

attaching the detail screen image also for refrence that we need same design for that feature
