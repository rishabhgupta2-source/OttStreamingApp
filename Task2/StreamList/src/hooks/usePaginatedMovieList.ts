import { useCallback, useEffect, useRef, useState } from 'react';
import type { Movie, PaginatedResponse } from '../api/types';
import type { PaginatedMovieListResource } from './asyncResourceTypes';
import { getErrorMessage } from '../utils/getErrorMessage';

type FetchPage = (page: number) => Promise<PaginatedResponse<Movie>>;

/** TMDB pages can overlap; keep first occurrence so FlatList keys stay unique. */
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

function normalizePageSlice(
  res: PaginatedResponse<Movie>,
): { results: Movie[]; page: number; total_pages: number } {
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
  return { results, page, total_pages };
}

/**
 * TMDB-style paginated movie list: base { data, loading, error, refetch } plus loadMore/hasMore.
 */
export function usePaginatedMovieList(
  resetKey: string | number,
  fetchPage: FetchPage,
  options: { enabled?: boolean } = {},
): PaginatedMovieListResource {
  const { enabled = true } = options;
  const [data, setData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reloadGen = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const hasMore = page < totalPages;

  const runFirstPage = useCallback(() => {
    const gen = ++reloadGen.current;
    setData([]);
    setPage(1);
    setTotalPages(1);
    setError(null);
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchPageRef
      .current(1)
      .then((res) => {
        if (reloadGen.current !== gen) {
          return;
        }
        const slice = normalizePageSlice(res);
        setData(dedupeMoviesById(slice.results));
        setTotalPages(slice.total_pages);
        setPage(slice.page);
      })
      .catch((e) => {
        if (reloadGen.current !== gen) {
          return;
        }
        setError(getErrorMessage(e));
      })
      .finally(() => {
        if (reloadGen.current !== gen) {
          return;
        }
        setLoading(false);
      });
  }, [enabled]);

  useEffect(() => {
    runFirstPage();
  }, [resetKey, enabled, runFirstPage]);

  const loadMore = useCallback(() => {
    if (!enabled || loading || !(page < totalPages)) {
      return;
    }
    const gen = reloadGen.current;
    const nextPage = page + 1;
    setLoading(true);
    void fetchPageRef
      .current(nextPage)
      .then((res) => {
        if (reloadGen.current !== gen) {
          return;
        }
        const slice = normalizePageSlice(res);
        setData((prev) => dedupeMoviesById([...prev, ...slice.results]));
        setTotalPages(slice.total_pages);
        setPage(slice.page);
      })
      .catch((e) => {
        if (reloadGen.current !== gen) {
          return;
        }
        setError(getErrorMessage(e));
      })
      .finally(() => {
        if (reloadGen.current !== gen) {
          return;
        }
        setLoading(false);
      });
  }, [enabled, loading, page, totalPages]);

  const refetch = useCallback(() => {
    runFirstPage();
  }, [runFirstPage]);

  return {
    data,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
}
