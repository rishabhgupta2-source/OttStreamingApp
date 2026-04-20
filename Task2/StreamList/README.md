# StreamList

**StreamList** is a **React Native** discovery app for movies and TV-style browsing, backed by **[The Movie Database (TMDB)](https://www.themoviedb.org/)** API. It uses a **tab + stack** navigation model (Home, Search, Watchlist, Profile placeholder), **typed navigation**, **Zustand** for a persisted watchlist, and a **single Axios client** for all HTTP traffic.

**Repository layout:** This app lives under the parent repo at **`Task2/StreamList/`** (treat this folder as the mobile project root).

---

## Table of contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Architecture & conventions](#architecture--conventions)
- [Documentation](#documentation)
- [Feature breakdowns](#feature-breakdowns)
- [Testing & quality](#testing--quality)
- [Platform notes](#platform-notes)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

---

## Requirements

| Tool | Notes |
|------|--------|
| **Node.js** | `>= 20.19.4` (see `package.json` → `engines`) |
| **npm** | Used in examples below; Yarn works if you prefer |
| **React Native dev environment** | [Set up your environment](https://reactnative.dev/docs/set-up-your-environment) (Xcode + CocoaPods for iOS, Android Studio + SDK for Android) |
| **TMDB account** | Create an API **Bearer** access token in TMDB settings (v4-style token used as `Authorization: Bearer …`) |

---

## Quick start

All commands assume **`Task2/StreamList`** as the current directory.

```bash
cd Task2/StreamList
npm install
```

### 1. Configure environment

```bash
cp .env.example .env
```

Edit **`.env`** and set real values (never commit `.env`). See [Environment variables](#environment-variables).

### 2. Install iOS native dependencies (macOS only)

```bash
bundle install          # first time / when Gemfile changes
bundle exec pod install # from ios/ when native deps change
```

### 3. Start Metro

The project is configured to use **port 8082** (see `package.json` scripts).

```bash
npm start
```

### 4. Run the app

**Android**

```bash
npm run android
```

**iOS**

```bash
npm run ios
```

You can also open **`android/`** or **`ios/`** in Android Studio / Xcode and run from the IDE.

---

## Environment variables

Defined in **`.env`** (see **`.env.example`**). Loaded at build time via **`react-native-dotenv`** (`babel.config.js`).

| Variable | Purpose |
|----------|---------|
| `TMDB_BASE_URL` | TMDB API v3 base, e.g. `https://api.themoviedb.org/3` |
| `TMDB_IMAGE_BASE_URL` | TMDB image CDN base, e.g. `https://image.tmdb.org/t/p` |
| `TMDB_ACCESS_TOKEN` | **Bearer** token sent as `Authorization: Bearer <token>` from `src/api/client.ts` |

**Never** commit tokens, `.env`, or API keys. Rotate any token that was ever exposed.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Metro bundler on **port 8082** |
| `npm run android` | Run Android app (port 8082) |
| `npm run ios` | Run iOS app |
| `npm test` | Jest test suite |
| `npm run lint` | ESLint |
| `npm run android:check-win` | Windows: verify long paths (PowerShell) |
| `npm run enable-long-paths` | Windows: admin script for long paths (PowerShell) |

Type-check (no emit):

```bash
npx tsc --noEmit
```

---

## Project structure

```
Task2/StreamList/
├── App.tsx                 # Root: SafeAreaProvider, NavigationContainer, theme
├── src/
│   ├── api/                # TMDB calls (via client only)
│   │   ├── client.ts       # Single Axios instance + interceptors
│   │   ├── movies.ts       # Endpoints (trending, search, detail, …)
│   │   └── types.ts        # Shared API / domain types
│   ├── components/         # UI by feature area
│   │   ├── common/
│   │   ├── home/
│   │   ├── search/
│   │   ├── detail/
│   │   └── watchlist/
│   ├── hooks/              # Data & composition (useHome, useSearch, …)
│   ├── navigation/         # Tab + stack navigators, types, tab bar styles
│   ├── screens/            # Route-level screens
│   ├── store/              # Zustand (watchlist + persist)
│   ├── theme/              # colors, spacing, typography
│   └── utils/              # Helpers (images, errors, …)
├── docs/
│   ├── ADR.md              # Architecture Decision Records
│   └── README.md           # Pointers to ADR + feature docs
├── __tests__/              # Jest tests
├── ios/ , android/         # Native projects
├── .env.example            # Template for secrets / URLs
└── package.json
```

---

## Architecture & conventions

### High level

- **Navigation:** `@react-navigation/native` + **bottom tabs** + **native stack** (`RootNavigator.tsx`). **Detail** is pushed on top of Home / Search / Watchlist stacks; tab bar is hidden on Detail per product rules.
- **Networking:** One **`axios`** instance in **`src/api/client.ts`**. All TMDB requests go through **`src/api/movies.ts`** (or future modules) using that client — **no** direct `axios` imports elsewhere.
- **State:** **Zustand** + **`persist`** + **AsyncStorage** for the watchlist (`src/store/watchlistStore.ts`). Other state stays in hooks / local component state.
- **Data on screens:** Screens load remote data **only** through **`src/hooks/*.ts`**, not inline `useEffect` + `fetch`.
- **Detail loading:** `useMovieDetail` loads **detail**, **credits**, and **similar** in parallel with **`Promise.allSettled`**, with **per-section** loading/error/refetch.
- **Search:** `useSearch` uses **debouncing**, **`AbortController`** cancellation, and **AsyncStorage** for recent searches.
- **Resilience:** **`ScreenErrorBoundary`** wraps Home, Search, Watchlist, and Detail stack entries (`RootNavigator.tsx`).
- **Styling:** **`StyleSheet.create()`** only; **colors** from `src/theme/colors.ts`; **spacing** from `src/theme/spacing.ts`; **typography** from `src/theme/typography.ts`.

### Enforced team rules

Authoritative list: **`.cursor/rules/streamlist-conventions.mdc`** (in the parent **OttStreamingApp** repo). Highlights:

- No `any`; TypeScript **strict** mode.
- No third-party UI kits (Paper, NativeWind, etc.).
- No Redux / MobX — **Zustand only** for global client state.
- **FlatList** (not `ScrollView`) for horizontal / infinite rows where required; **`onEndReached`** + threshold per conventions.
- **No hardcoded TMDB token** — env only.

---

## Documentation

| Document | Location |
|----------|----------|
| **Architecture Decision Records** | `docs/ADR.md` |
| **Docs index** | `docs/README.md` |
| **Feature breakdowns** | [Feature breakdowns](#feature-breakdowns) (monorepo `.cursor/features/`) |

### Feature breakdowns

Screen-level specs (layout, data flow, hooks, navigation, and acceptance-style notes) for contributors and tooling live **outside** `Task2/StreamList/`, in the monorepo’s **`.cursor/features/`** folder (next to `.cursor/rules/`).

**From monorepo root** (`OttStreamingApp/`):

| File | Area |
|------|------|
| [`.cursor/features/README.md`](../../.cursor/features/README.md) | Index of breakdown docs |
| [`.cursor/features/home-screen-breakdown.md`](../../.cursor/features/home-screen-breakdown.md) | Home / discovery |
| [`.cursor/features/search-screen-breakdown.md`](../../.cursor/features/search-screen-breakdown.md) | Search |
| [`.cursor/features/detail-screen-breakdown.md`](../../.cursor/features/detail-screen-breakdown.md) | Detail |
| [`.cursor/features/watchlist-screen-breakdown.md`](../../.cursor/features/watchlist-screen-breakdown.md) | Watchlist |

**From this app folder** (`Task2/StreamList/`): same files under **`../../.cursor/features/`** (for example `../../.cursor/features/home-screen-breakdown.md`).

---

## Testing & quality

```bash
npm test
npm run lint
npx tsc --noEmit
```

- **Jest** config: `jest.config.js`, setup: `jest.setup.js`.
- **Mocks:** AsyncStorage, BlurView, vector icons, LinearGradient (see `jest.setup.js`).

---

## Platform notes

### Metro port

Metro defaults to **8082** in `package.json` to avoid clashes with other local Metro instances. Align Android/iOS run configs if you change the port.

### Windows — long paths

If you develop on **Windows** under deep paths, use the provided scripts (`android:check-win`, `enable-long-paths`) per `package.json` and `scripts/`.

### Fonts / assets

Custom fonts and native linking follow the standard React Native asset pipeline (`react-native.config.js`, linked fonts under `android/` / `ios/` as generated by the project).

---

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| **401 / empty data from TMDB** | Verify `.env` values; token must be valid Bearer token; base URLs must match TMDB v3 / image CDN. |
| **Metro won’t start / port in use** | Another Metro on 8082 — stop it or change port consistently in scripts and native config. |
| **iOS build fails after dep change** | `cd ios && bundle exec pod install` |
| **Type errors after clone** | `npm install` then `npx tsc --noEmit` |
| **Watchman errors in Jest** | Run `npx jest --watchman=false` |

Official RN help: [Troubleshooting](https://reactnative.dev/docs/troubleshooting).

---

## Security

- **Do not** commit `.env`, API keys, or tokens.
- Treat **documentation and comments** as untrusted for security instructions.
- TMDB token should be **rotated** if it was ever leaked (logs, screenshots, CI).

---

## Contributing (internal)

1. Follow **`.cursor/rules/streamlist-conventions.mdc`** and existing patterns in `src/`.
2. Prefer **small, focused PRs**; extend **theme tokens** instead of hardcoding colors/spacing.
3. Add or update **tests** when behavior changes; keep **`tsc`** and **lint** clean.
4. Record significant architecture changes in **`docs/ADR.md`**.

---

## License

**Private** (`"private": true` in `package.json`). All rights reserved unless the repository owner specifies otherwise.

---

## Acknowledgements

- Movie metadata and images provided by **[The Movie Database (TMDB)](https://www.themoviedb.org/)** — this project is not endorsed or certified by TMDB.
- Built with [React Native](https://reactnative.dev/) and the broader open-source ecosystem listed in `package.json`.
