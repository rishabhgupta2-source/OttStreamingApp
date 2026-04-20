import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getGenres, getTopRated, getTrending } from '../api/movies';
import type { Genre } from '../api/types';
import { useAsyncResource } from './useAsyncResource';
import { usePaginatedMovieList } from './usePaginatedMovieList';

const EMPTY_GENRES: Genre[] = [];

/** How many genre discover rows to show initially on "All", and per vertical "load more". */
const GENRE_ROW_BATCH = 4;

export type GenreDiscoverSection = {
  genreId: number;
  title: string;
};

/**
 * Home screen data: composed async resources (standard { data, loading, error, refetch }
 * per slice; paginated rows add loadMore / hasMore). Genre selection stays local to this hook.
 *
 * "All" (`selectedGenreId === null`): trending, top rated, then batched discover rows per genre
 * (vertical pagination via `loadMoreGenres`). A specific chip: same global rows + one discover row
 * for that genre only.
 */
export function useHome() {
  const [selectedGenreId, setSelectedGenre] = useState<number | null>(null);
  const [visibleGenreIds, setVisibleGenreIds] = useState<number[]>([]);
  const prevSelectedRef = useRef<number | null | undefined>(undefined);
  const lastGenreAppendAt = useRef(0);

  const genres = useAsyncResource(
    () => getGenres().then((response) => response.genres),
    [],
    EMPTY_GENRES,
    true,
  );

  const trending = usePaginatedMovieList('trending', (page) =>
    getTrending(page),
  );

  const topRated = usePaginatedMovieList('top_rated', (page) =>
    getTopRated(page),
  );

  useEffect(() => {
    const previous = prevSelectedRef.current;
    prevSelectedRef.current = selectedGenreId;

    if (selectedGenreId !== null) {
      setVisibleGenreIds([selectedGenreId]);
      return;
    }

    if (genres.data.length === 0) {
      setVisibleGenreIds([]);
      return;
    }

    const switchedFromChipToAll =
      previous !== undefined && previous !== null && selectedGenreId === null;

    if (switchedFromChipToAll) {
      setVisibleGenreIds(
        genres.data.slice(0, GENRE_ROW_BATCH).map((genre) => genre.id),
      );
      return;
    }

    setVisibleGenreIds((prev) => {
      if (prev.length > 0) {
        return prev;
      }
      return genres.data.slice(0, GENRE_ROW_BATCH).map((genre) => genre.id);
    });
  }, [selectedGenreId, genres.data]);

  const genreDiscoverSections: GenreDiscoverSection[] = useMemo(() => {
    if (selectedGenreId !== null) {
      return [
        {
          genreId: selectedGenreId,
          title:
            genres.data.find((genre) => genre.id === selectedGenreId)?.name ??
            'Movies',
        },
      ];
    }
    return visibleGenreIds.map((genreId) => ({
      genreId,
      title:
        genres.data.find((genre) => genre.id === genreId)?.name ?? 'Movies',
    }));
  }, [selectedGenreId, visibleGenreIds, genres.data]);

  const hasMoreGenres =
    selectedGenreId === null && visibleGenreIds.length < genres.data.length;

  const loadMoreGenres = useCallback(() => {
    if (selectedGenreId !== null) {
      return;
    }
    const now = Date.now();
    if (now - lastGenreAppendAt.current < 500) {
      return;
    }
    lastGenreAppendAt.current = now;

    const allIds = genres.data.map((genre) => genre.id);
    setVisibleGenreIds((prev) => {
      const existing = new Set(prev);
      const remaining = allIds.filter((id) => !existing.has(id));
      const nextSlice = remaining.slice(0, GENRE_ROW_BATCH);
      if (nextSlice.length === 0) {
        return prev;
      }
      return [...prev, ...nextSlice];
    });
  }, [selectedGenreId, genres.data]);

  return {
    genres,
    trending,
    topRated,
    genreDiscoverSections,
    hasMoreGenres,
    loadMoreGenres,
    selectedGenreId,
    setSelectedGenre,
  };
}
