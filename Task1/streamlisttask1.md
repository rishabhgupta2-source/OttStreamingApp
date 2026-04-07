# 1.  Main Feature Breakdown — Watchlist

1. Navigation Layer  
Defines app navigation using React Navigation v6 with Bottom Tabs and Stack for Watchlist flow.

2. Watchlist Screen Composition  
Main screen responsible for structuring layout, integrating components, and handling conditional rendering.

3. Filtering System (All / Movies / Series)  
Allows users to filter watchlist content dynamically using a segmented control connected to global state.

4. Watchlist Content Display (Grid + Card)  
Displays saved items in a 2-column grid using FlatList, with reusable card components for each item.

5. State Management & Persistence  
Manages watchlist data using Zustand and persists it locally using AsyncStorage.

6. Data Handling & Recommendations  
Handles API interaction via Axios, processes data through custom hooks, and displays recommendation content.

----------------------------------------------------------------------------------

# 2. Two Full Prompts

---

##  Prompt 1: State Management & Persistence (Zustand)

### Context

We are building a React Native OTT app using TypeScript.  
The Watchlist feature requires global state using Zustand and local persistence using AsyncStorage.

Constraints:
- Use Zustand only (no Redux/Context)
- Use AsyncStorage for persistence
- No data logic inside components

---

### Decomposition

- Define Watchlist types
- Create Zustand store
- Add state (items, selectedFilter, loading)
- Add actions (setItems, setFilter, removeItem)
- Persist and hydrate data using AsyncStorage

---

### Instructions

Create:

src/store/watchlistStore.ts

- Define types:
  - WatchlistItem (id, title, image, type)
  - FilterType ('ALL' | 'MOVIES' | 'SERIES')

- Create Zustand store with:
  - items, selectedFilter, loading
  - actions: setItems, setFilter, removeItem, hydrateFromStorage

- Integrate AsyncStorage:
  - Save items on update
  - Load items on initialization

- Use async/await and proper error handling  
- Export hook: useWatchlistStore  
- Keep code typed and modular  

---

##  Prompt 2: Watchlist Content Display (Grid + Filtering)

### Context

We are building the Watchlist screen UI in React Native.  
The screen should display watchlist items with filtering and grid layout.

Constraints:
- Use Zustand for state
- Use FlatList (not ScrollView)
- Use StyleSheet.create only
- No API calls inside screen

---

### Decomposition

- Get state from store
- Apply filtering logic
- Render header and filter tabs
- Show empty state or grid
- Render list using FlatList

---

### Instructions

Create:

src/screens/watchlist/WatchlistScreen.tsx

- Use functional component (TypeScript)
- Get items, selectedFilter, setFilter from Zustand

- Apply filtering:
  - ALL → all items
  - MOVIES → type === 'movie'
  - SERIES → type === 'series'

- Layout:
  - SafeAreaView with dark background
  - Header ("My Watchlist")
  - Filter tabs

- Conditional rendering:
  - If no items → EmptyWatchlist
  - Else → FlatList grid + RecommendationSection

- FlatList:
  - numColumns = 2
  - keyExtractor = item.id



----------------------------------------------------------------


# 3. Plan Mode Outline

##  Selected Task
Watchlist Screen Composition (Filtering + Grid + State Integration)

---

##  Objective

Before writing code, the Agent should:
- Understand how state (Zustand) connects to UI
- Plan filtering logic and rendering flow
- Identify all required components
- Ensure constraints are followed (no API calls, FlatList only, etc.)

---

##  Questions the Agent Should Ask

1. Where does the watchlist data come from?
   → Zustand store (watchlistStore.ts)

2. How is persistence handled?
   → AsyncStorage integrated inside Zustand store

3. Where should filtering logic be implemented?
   → Inside WatchlistScreen using selectedFilter

4. What UI states are required?
   → Empty state  
   → Populated state (grid + recommendations)

5. What components are available for composition?
   → Header  
   → WatchlistFilterTabs  
   → EmptyWatchlist  
   → WatchlistCard  
   → RecommendationSection  

6. What constraints must be followed?
   → Use FlatList for grid  
   → No API calls in screen  
   → Use StyleSheet.create only  

---

##  Files to Reference

- src/store/watchlistStore.ts  
- src/screens/watchlist/WatchlistScreen.tsx  
- src/components/common/Header.tsx  
- src/components/watchlist/WatchlistFilterTabs.tsx  
- src/components/watchlist/WatchlistCard.tsx  
- src/components/watchlist/EmptyWatchlist.tsx  
- src/components/watchlist/RecommendationSection.tsx  

---

##  Step-by-Step Plan

1. Import required modules:
   - React, React Native components  
   - Zustand store  
   - UI components  

2. Connect Zustand store:
   - Extract items, selectedFilter, setFilter  

3. Implement filtering logic:
   - ALL → return all items  
   - MOVIES → filter type === 'movie'  
   - SERIES → filter type === 'series'  

4. Setup screen layout:
   - SafeAreaView (dark background)  
   - Header at top  

5. Add Filter Tabs:
   - Pass selectedFilter and setFilter  

6. Implement conditional rendering:
   - If filteredItems is empty → render EmptyWatchlist  
   - Else → render grid and recommendations  

7. Configure FlatList:
   - numColumns = 2  
   - keyExtractor = item.id  
   - Render WatchlistCard  

8. Add RecommendationSection below grid  

9. Apply styles using StyleSheet.create  

---

##  Expected Output

The Agent should produce:
- A clean WatchlistScreen.tsx file  
- Proper filtering implementation  
- Correct FlatList grid layout  
- Working empty vs populated UI  
- Clear separation of concerns  

---


##  Final Note

The Agent must follow this flow:

Zustand Store → Screen Logic → UI Components

No deviation from this structure is allowed.


----------------------------------------------------------------------------------


# 4. .cursor/rules Additions

##  Rule 1: Enforce Zustand for All Watchlist State

**Rule:**
All Watchlist-related state must be managed using Zustand.  
Do not use Redux, Context API, or local component state for shared data.

**Reasoning:**
This feature relies on a centralized state (watchlist items, filters, persistence).  
AI often defaults to Redux or inline state, which breaks the prescribed architecture.  
This rule ensures consistent state management and prevents over-engineering.

---

##  Rule 2: No API or AsyncStorage Logic Inside Components

**Rule:**
Components must not contain API calls or AsyncStorage logic.  
All data fetching should be handled via custom hooks, and persistence must be handled inside the Zustand store.

**Reasoning:**
AI frequently mixes data logic with UI components, leading to poor separation of concerns.  
This rule enforces a clean architecture:
Service Layer → Hook → Store → UI  
It improves maintainability and aligns with the AI-first design pattern.

---

##  Rule 3: Use FlatList for Grid Rendering (No ScrollView)

**Rule:**
All list rendering for Watchlist items must use FlatList with numColumns = 2.  
ScrollView must not be used for rendering lists or grids.

**Reasoning:**
AI often defaults to ScrollView for simplicity, which causes performance issues and breaks grid layouts.  
FlatList ensures efficient rendering, proper spacing, and scalability for large datasets.

---

-----------------------------------------------------------------------------------



# 5. AI Failure Anticipation

---

##  Failure 1: Incorrect or Incomplete Filtering Logic

**What AI Might Do:**
- Implement filtering but:
  - Forget to handle one case (e.g., SERIES)
  - Apply filter incorrectly (case mismatch, wrong field)
  - Not recompute filtered data when selectedFilter changes
- Hardcode filtered results instead of dynamically deriving them

---

**Why This Still Happens (Even With Rules):**
Rules enforce structure, but not correctness of logic.  
AI may follow architecture but still produce incorrect business logic.

---

**How to Catch It in Review:**
- Switch between:
  - All → Movies → Series  
- Verify:
  - Data updates correctly each time  
  - No stale or unchanged UI  
  - All categories return correct items  

---

**Correction (Follow-up Prompt):**

Fix the filtering logic to correctly handle all filter types (ALL, MOVIES, SERIES).  
Ensure filtering is dynamically derived from items using selectedFilter.  
Recompute filteredItems whenever selectedFilter or items change.  
Do not hardcode filtered results.

---

##  Failure 2: Broken UI Composition or Conditional Rendering

**What AI Might Do:**
- Render EmptyWatchlist even when data exists  
- Show both Empty State and Grid together  
- Misplace components (e.g., recommendations above grid or missing entirely)  
- Skip conditional rendering logic altogether  

---

**Why This Still Happens:**
AI often struggles with **UI state composition**, especially when multiple conditions exist.  
Rules don’t guarantee correct rendering order or conditions.

---

**How to Catch It in Review:**
- Test scenarios:
  - No items → only Empty State visible  
  - With items → grid + recommendations visible  
- Verify:
  - No overlapping UI  
  - Correct component order  

---

**Correction (Follow-up Prompt):**

Fix the conditional rendering in WatchlistScreen.  
Ensure:
- EmptyWatchlist is shown only when filteredItems is empty  
- Grid and RecommendationSection are shown only when data exists  
- Do not render both states at the same time  
- Maintain correct component order: Filter Tabs → Grid → Recommendations  

---

##  Summary

These failures occur because:
- AI may follow architecture but miss logic correctness  
- UI state handling requires precise conditional reasoning  



-----------------------------------------------------------------------------------

# 6. One Thing I Learned

One key thing that changed my perspective on AI-assisted development is that **the quality of output depends more on how we structure the problem than how we write the code prompt itself**.

AI tends to fall back to its default patterns (like Redux, ScrollView, or inline logic), even if those are incorrect for the problem.

What surprised me most is that **breaking features into small, atomic tasks and guiding AI with a structured plan produces far more reliable and scalable results than writing a single large prompt**.

This shifted my approach from:
"Ask AI to build a feature"

to:
"Design the system, then guide AI step-by-step to implement it correctly"
