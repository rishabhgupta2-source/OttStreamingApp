import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { searchMovies } from '../api/movies';
import type { Movie, PaginatedResponse } from '../api/types';
import { getErrorMessage } from '../utils/getErrorMessage';

const RECENT_KEY = 'streamlist_recent_searches';
const DEBOUNCE_MS = 400;

function parseRecent(raw: string | null): string[] {
  if (raw === null || raw === '') {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function dedupeMoviesById(movies: Movie[]): Movie[] {
  const seen = new Set<number>();
  const out: Movie[] = [];
  for (const movie of movies) {
    if (
      typeof movie.id !== 'number' ||
      !Number.isFinite(movie.id) ||
      seen.has(movie.id)
    ) {
      continue;
    }
    seen.add(movie.id);
    out.push(movie);
  }
  return out;
}

function normalizeSearchPage(res: PaginatedResponse<Movie>): {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
} {
  const results = Array.isArray(res.results) ? res.results : [];
  const page =
    typeof res.page === 'number' && Number.isFinite(res.page) && res.page >= 1
      ? res.page
      : 1;
  const total_pages =
    typeof res.total_pages === 'number' &&
    Number.isFinite(res.total_pages) &&
    res.total_pages >= 1
      ? res.total_pages
      : 1;
  const total_results =
    typeof res.total_results === 'number' && Number.isFinite(res.total_results)
      ? res.total_results
      : 0;
  return { results, page, total_pages, total_results };
}

function mergeRecentTerms(term: string, previous: string[]): string[] {
  const trimmed = term.trim();
  if (trimmed === '') {
    return previous;
  }
  return [trimmed, ...previous.filter((t) => t !== trimmed)].slice(0, 5);
}

function isCanceledSearchError(e: unknown): boolean {
  if (e instanceof Error) {
    if (e.name === 'AbortError' || e.name === 'CanceledError') {
      return true;
    }
  }
  if (typeof e === 'object' && e !== null) {
    const rec = e as Record<string, unknown>;
    if (rec.__CANCEL__ === true) {
      return true;
    }
    if (rec.code === 'ERR_CANCELED') {
      return true;
    }
    const msg =
      typeof rec.message === 'string' ? rec.message.toLowerCase() : '';
    if (
      msg.includes('canceled') ||
      msg.includes('cancelled') ||
      msg.includes('cancel') ||
      msg.includes('abort')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Search screen remote state: debounced query, abortable fetch, recent searches in AsyncStorage.
 */
export function useSearch() {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchSeqRef = useRef(0);
  const recentSearchesRef = useRef<string[]>([]);

  useEffect(() => {
    recentSearchesRef.current = recentSearches;
  }, [recentSearches]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => {
        if (cancelled) {
          return;
        }
        const list = parseRecent(raw);
        setRecentSearches(list);
        recentSearchesRef.current = list;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const persistRecentList = useCallback(async (list: string[]) => {
    setRecentSearches(list);
    recentSearchesRef.current = list;
    if (list.length === 0) {
      await AsyncStorage.removeItem(RECENT_KEY);
    } else {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list));
    }
  }, []);

  const saveRecentSearch = useCallback(
    async (term: string) => {
      const next = mergeRecentTerms(term, recentSearchesRef.current);
      await persistRecentList(next);
    },
    [persistRecentList],
  );

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    recentSearchesRef.current = [];
    try {
      await AsyncStorage.removeItem(RECENT_KEY);
    } catch {
      try {
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify([]));
      } catch {
        // UI is already cleared; storage may be unavailable.
      }
    }
  }, []);

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (trimmed === '') {
        setResults([]);
        setTotalResults(0);
        setSearchPage(0);
        setTotalPages(1);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const seq = ++searchSeqRef.current;
      setLoading(true);
      setError(null);

      try {
        const res = await searchMovies(trimmed, 1, controller.signal);
        if (seq !== searchSeqRef.current) {
          return;
        }
        const slice = normalizeSearchPage(res);
        setResults(dedupeMoviesById(slice.results));
        setTotalResults(slice.total_results);
        setSearchPage(slice.page);
        setTotalPages(slice.total_pages);
        const nextRecent = mergeRecentTerms(trimmed, recentSearchesRef.current);
        await persistRecentList(nextRecent);
      } catch (e: unknown) {
        if (isCanceledSearchError(e)) {
          return;
        }
        if (seq !== searchSeqRef.current) {
          return;
        }
        setError(getErrorMessage(e));
        setResults([]);
        setTotalResults(0);
        setSearchPage(0);
        setTotalPages(1);
      } finally {
        if (seq === searchSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [persistRecentList],
  );

  const loadMoreSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed === '' || loading || loadingMore) {
      return;
    }
    if (searchPage < 1 || searchPage >= totalPages) {
      return;
    }

    const seq = searchSeqRef.current;
    const nextPage = searchPage + 1;
    setLoadingMore(true);
    setError(null);

    try {
      const res = await searchMovies(trimmed, nextPage);
      if (seq !== searchSeqRef.current) {
        return;
      }
      if (query.trim() !== trimmed) {
        return;
      }
      const slice = normalizeSearchPage(res);
      setResults((prev) => dedupeMoviesById([...prev, ...slice.results]));
      setTotalResults(slice.total_results);
      setSearchPage(slice.page);
      setTotalPages(slice.total_pages);
    } catch (e: unknown) {
      if (isCanceledSearchError(e)) {
        return;
      }
      if (seq !== searchSeqRef.current) {
        return;
      }
      setError(getErrorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, query, searchPage, totalPages]);

  /**
   * Typed input: `searchMovies` runs only from the debounced `setTimeout` (never per keystroke).
   * Genre chips / recent rows / retry use {@link runSearchNow} / {@link retrySearch} instead.
   */
  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = null;

      if (q.trim() === '') {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setResults([]);
        setTotalResults(0);
        setSearchPage(0);
        setTotalPages(1);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        runSearch(q).catch(() => {});
      }, DEBOUNCE_MS);
    },
    [runSearch],
  );

  /** Chip / recent row: update query and fetch immediately (no debounce). */
  const runSearchNow = useCallback(
    (term: string) => {
      setQueryState(term);
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      const trimmed = term.trim();
      if (trimmed === '') {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setResults([]);
        setTotalResults(0);
        setSearchPage(0);
        setTotalPages(1);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        return;
      }
      runSearch(term).catch(() => {});
    },
    [runSearch],
  );

  const retrySearch = useCallback(() => {
    runSearch(query).catch(() => {});
  }, [query, runSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = null;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  const hasMore = searchPage >= 1 && searchPage < totalPages;

  return {
    query,
    setQuery,
    runSearchNow,
    retrySearch,
    results,
    loading,
    loadingMore,
    error,
    totalResults,
    hasMore,
    loadMoreSearch,
    recentSearches,
    saveRecentSearch,
    clearRecentSearches,
  };
}
