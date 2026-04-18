# Search Screen — Feature Breakdown

# IMPORTANT INSTRUCTIONS
- Always refer to this file before building any Search component or hook
- Follow the Build Order strictly
- Implement only one step at a time
- Do not mix steps


## Overview
SearchScreen has exactly TWO states.
State 1 (Default): shown when query is empty
State 2 (Results): shown when query has text
Never mix content from both states on screen at the same time.

## File Structure to Create
src/
├── components/
│   └── search/
│       ├── SearchBar.tsx           ← always visible input
│       ├── RecentSearches.tsx      ← shown in default state only
│       ├── SearchResultsGrid.tsx   ← shown in results state only
│       └── SearchDefaultView.tsx   ← wraps default state content
├── hooks/
│   └── useSearch.ts                ← ALL search logic lives here
├── api/
│   └── movies.ts                   ← add searchMovies function here
└── screens/
    └── SearchScreen.tsx            ← assembles all components

## Build Order (strict — do not mix steps)
Step 1 → Add searchMovies to src/api/movies.ts
Step 2 → Build useSearch hook
Step 3 → Build SearchBar component
Step 4 → Build RecentSearches component
Step 5 → Build SearchResultsGrid component
Step 6 → Build SearchDefaultView component
Step 7 → Assemble SearchScreen.tsx
Step 8 → Register Detail in SearchStack navigation
Step 9 → Verify debounce + request cancellation
Step 10 → Edge case sweep
Step 11 → Final sign-off checklist

## STATE 1 — Default (query is empty)

### Section 1 — Header
- File: SearchScreen.tsx (inline, not a separate component)
- Left: "STREAMLIST" Manrope-Bold 20px colors.primary_container
- Right: circular avatar placeholder (View 36x36, borderRadius 18, colors.surface_container_high)
- No action on avatar
- Background: transparent

### Section 2 — SearchBar
- File: src/components/search/SearchBar.tsx
- Props: value, onChangeText, placeholder
- Background: colors.surface_container_low (#1C1B1B), borderRadius 12
- Magnifier icon "🔍" on left, colors.on_surface_variant
- TextInput: placeholder "Search movies, actors, directors..."
- Focused state: borderWidth 1, borderColor colors.outline_variant (rgba 15% opacity)
- marginHorizontal 16, marginBottom 12
- Edge case: focused border must not cause layout shift

### Section 3 — Genre Quick Filter Chips
- File: src/components/search/SearchDefaultView.tsx
- Hardcoded names: ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Documentary']
- Uses GenreChip from src/components/common/GenreChip.tsx (reuse Day 2 component)
- Horizontal ScrollView, no scroll indicator
- Tapping a chip: sets query = genre name AND immediately triggers search
- All chips inactive by default (none pre-selected)
- Edge case: chip tap must both populate search bar AND show results

### Section 4 — Recent Searches
- File: src/components/search/RecentSearches.tsx
- Props: searches[], onSelectSearch, onClearAll
- AsyncStorage key: 'streamlist_recent_searches'
- Maximum 5 entries
- Header: "Recent Searches" (Manrope-Bold 28px) + "CLEAR ALL" right (Inter-SemiBold 14px, colors.primary_container, uppercase)
- Each item: clock icon "🕐" + search term (Inter-Regular 14px, colors.on_surface)
- Shown ONLY when searches.length > 0
- Tapping item: sets query = term AND triggers search
- "CLEAR ALL": removes from AsyncStorage AND clears UI immediately
- Edge case: do not show section header when list is empty
- Edge case: recent searches must persist across app restarts

### Section 5 — Trending Now (default view)
- File: src/components/search/SearchDefaultView.tsx
- First item: large featured landscape card with "FEATURED" badge (colors.secondary_container bg)
- Below: 2-column grid of remaining trending movies
- Loading state: SkeletonCards
- Edge case: if trending API fails, hide section gracefully

## STATE 2 — Results (query has text)

### Section 6 — Result Count Label
- File: src/components/search/SearchResultsGrid.tsx
- Format: "{n} results for '{query}'"
- Inter-Regular 12px, colors.on_surface_variant
- paddingHorizontal 16, paddingBottom 8
- Hidden when results.length === 0

### Section 7 — Results Grid
- File: src/components/search/SearchResultsGrid.tsx
- FlatList with numColumns={2} (NOT two side-by-side ScrollViews)
- Each card: ContentCard (reuse from Day 2), width = (screenWidth/2 - 24)
- Shows: poster, title, year, rating badge
- Loading state: 6 SkeletonCards in 2-column layout
- Edge case: null poster_path → placeholder (handled by ContentCard already)

### Section 8 — Zero Results State
- File: src/components/search/SearchResultsGrid.tsx
- Shown when: loading===false AND results.length===0 AND query!==''
- Centered View:
  - "🔍" emoji fontSize 48, marginBottom 16
  - "No results for '{query}'" Manrope-Bold 28px, colors.on_surface, textAlign center
  - "Try a different title, actor, or genre" Inter-Regular 14px, colors.on_surface_variant, marginTop 8
- Edge case: must show query text in the message (dynamic)

## API Contract

### searchMovies function
Endpoint: GET /search/movie?query={q}&page={page}
File: src/api/movies.ts (add to existing file)
Signature: searchMovies(query: string, page: number, signal?: AbortSignal)
Returns: PaginatedResponse<Movie>
Key fields used: id, title, poster_path, vote_average, release_date, genre_ids

## useSearch Hook Contract

### Required behaviour
1. DEBOUNCE (400ms):
   - useRef<ReturnType<typeof setTimeout> | null> for timer
   - clearTimeout before setting new timeout
   - API call fires ONLY inside setTimeout callback
   - Never fires on every keystroke

2. REQUEST CANCELLATION (AbortController):
   - useRef<AbortController | null> for controller
   - abort() previous before creating new controller
   - Pass signal to searchMovies()
   - Catch AbortError silently (do not set error state)

3. RECENT SEARCHES (AsyncStorage):
   - Load on mount
   - Save on completed search (when results arrive)
   - Deduplicate, max 5, newest first
   - Clear all removes from AsyncStorage

4. EMPTY QUERY:
   - Immediately clear results and totalResults
   - Do NOT fire API call for empty string

### Return shape
{
  query: string;
  setQuery: (q: string) => void;
  results: Movie[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  recentSearches: string[];
  saveRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

## Edge Cases Summary (all required)
1. Zero results → show designed empty state, not empty grid
2. Recent searches persist across app restarts (AsyncStorage)
3. Clear All removes from AsyncStorage and UI immediately
4. Genre chip tap → populates search bar AND shows results
5. Rapid typing → only last query results shown (AbortController)
6. Empty string → results clear, default view returns, no API call
7. null poster_path → ContentCard placeholder (already handled)
8. Search API fails → show error state with retry option
