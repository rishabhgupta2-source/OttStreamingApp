import apiClient from './client';
import type { Movie, PaginatedResponse, GenreListResponse } from './types';

/** Matches TMDB list endpoints (e.g. trending) default query: `language=en-US`. */
const DEFAULT_LANGUAGE = 'en-US';

export const getTrending = (
  page: number,
): Promise<PaginatedResponse<Movie>> =>
  apiClient
    .get<PaginatedResponse<Movie>>('/trending/movie/week', {
      params: { language: DEFAULT_LANGUAGE, page },
    })
    .then((r) => r.data);

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
