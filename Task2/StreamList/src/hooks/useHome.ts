import { useCallback, useState } from 'react';
import {
  getDiscoverByGenre,
  getGenres,
  getTopRated,
  getTrending,
} from '../api/movies';
import type { Genre } from '../api/types';
import { useAsyncResource } from './useAsyncResource';
import { usePaginatedMovieList } from './usePaginatedMovieList';

const EMPTY_GENRES: Genre[] = [];

/**
 * Home screen data: composed async resources (standard { data, loading, error, refetch }
 * per slice; paginated rows add loadMore / hasMore). Genre selection stays local to this hook.
 */
export function useHome() {
  const [selectedGenreId, setSelectedGenre] = useState<number | null>(null);

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

  const fetchGenrePage = useCallback(
    (page: number) => {
      if (selectedGenreId === null) {
        return Promise.reject(new Error('No genre selected'));
      }
      return getDiscoverByGenre(selectedGenreId, page);
    },
    [selectedGenreId],
  );

  const genreMovies = usePaginatedMovieList(
    selectedGenreId ?? 'none',
    fetchGenrePage,
    { enabled: selectedGenreId !== null },
  );

  return {
    genres,
    trending,
    topRated,
    genreMovies,
    selectedGenreId,
    setSelectedGenre,
  };
}
