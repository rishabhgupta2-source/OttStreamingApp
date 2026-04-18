import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { searchMovies } from '../api/movies';
import type { Movie } from '../api/types';
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
    if (!seen.has(movie.id)) {
      seen.add(movie.id);
      out.push(movie);
    }
  }
  return out;
}

function mergeRecentTerms(term: string, previous: string[]): string[] {
  const trimmed = term.trim();
  if (trimmed === '') {
    return previous;
  }
  return [trimmed, ...previous.filter((t) => t !== trimmed)].slice(0, 5);
}

function isCanceledSearchError(e: unknown): boolean {
  if (e instanceof Error && e.name === 'AbortError') {
    return true;
  }
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const msg = String((e as { message: unknown }).message).toLowerCase();
    return (
      msg.includes('canceled') ||
      msg.includes('cancel') ||
      msg.includes('abort')
    );
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
    await AsyncStorage.removeItem(RECENT_KEY);
  }, []);

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (trimmed === '') {
        setResults([]);
        setTotalResults(0);
        setLoading(false);
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
        const rows = Array.isArray(res.results) ? res.results : [];
        setResults(dedupeMoviesById(rows));
        setTotalResults(
          typeof res.total_results === 'number' ? res.total_results : 0,
        );
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
      } finally {
        if (seq === searchSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [persistRecentList],
  );

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
        setLoading(false);
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
        setLoading(false);
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

  return {
    query,
    setQuery,
    runSearchNow,
    retrySearch,
    results,
    loading,
    error,
    totalResults,
    recentSearches,
    saveRecentSearch,
    clearRecentSearches,
  };
}
