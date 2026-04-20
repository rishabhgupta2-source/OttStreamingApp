import apiClient from './client';
import type {
  Credits,
  GenreListResponse,
  Movie,
  MovieDetail,
  PaginatedResponse,
} from './types';

/** TMDB list query default: `language=en-US` (trending, top_rated, discover, genres). */
const DEFAULT_LANGUAGE = 'en-US';

export const getTrending = (
  page: number,
): Promise<PaginatedResponse<Movie>> =>
  apiClient
    .get<PaginatedResponse<Movie>>('/trending/movie/week', {
      params: { language: DEFAULT_LANGUAGE, page },
    })
    .then((r) => r.data);

/**
 * GET /movie/top_rated — paginated `{ page, results, total_pages, total_results }`.
 * Query params match TMDB: `language` (e.g. en-US) and `page`.
 * @see https://developer.themoviedb.org/reference/movie-top-rated-list
 */
export const getTopRated = (
  page: number,
): Promise<PaginatedResponse<Movie>> =>
  apiClient
    .get<PaginatedResponse<Movie>>('/movie/top_rated', {
      params: { language: DEFAULT_LANGUAGE, page },
    })
    .then((r) => r.data);

export const getGenres = (): Promise<GenreListResponse> =>
  apiClient
    .get<GenreListResponse>('/genre/movie/list', {
      params: { language: DEFAULT_LANGUAGE },
    })
    .then((r) => r.data);

export const getDiscoverByGenre = (
  genreId: number,
  page: number,
): Promise<PaginatedResponse<Movie>> =>
  apiClient
    .get<PaginatedResponse<Movie>>('/discover/movie', {
      params: {
        language: DEFAULT_LANGUAGE,
        page,
        with_genres: genreId,
      },
    })
    .then((r) => r.data);

export const searchMovies = (
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<PaginatedResponse<Movie>> =>
  apiClient
    .get<PaginatedResponse<Movie>>('/search/movie', {
      params: { query, page },
      signal,
    })
    .then((r) => r.data);

export const getMovieDetail = (id: number): Promise<MovieDetail> =>
  apiClient
    .get<MovieDetail>(`/movie/${id}`, {
      params: { language: DEFAULT_LANGUAGE },
    })
    .then((r) => r.data);

export const getMovieCredits = (id: number): Promise<Credits> =>
  apiClient
    .get<Credits>(`/movie/${id}/credits`, {
      params: { language: DEFAULT_LANGUAGE },
    })
    .then((r) => r.data);

export const getSimilarMovies = (
  id: number,
): Promise<PaginatedResponse<Movie>> =>
  apiClient
    .get<PaginatedResponse<Movie>>(`/movie/${id}/similar`, {
      params: { language: DEFAULT_LANGUAGE, page: 1 },
    })
    .then((r) => r.data);
