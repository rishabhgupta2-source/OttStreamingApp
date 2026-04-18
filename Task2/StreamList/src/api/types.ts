/** TMDB movie list item (trending, top_rated, discover). Extra list fields are optional. */
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  /** TMDB may omit or null this on list/search rows (e.g. unreleased titles). */
  release_date: string | null;
  genre_ids: number[];
  overview: string;
  vote_count?: number;
  popularity?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface GenreListResponse {
  genres: Genre[];
}

/**
 * GET /movie/{id} detail shape. `genres` are full {@link Genre} objects — unlike {@link Movie.genre_ids}.
 */
export interface MovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genres: Genre[];
  runtime: number | null;
  overview: string;
}

/** TMDB /movie/{id}/credits `cast[]` row; `order` is billing order (lower = higher billed). */
export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Credits {
  id: number;
  cast: Cast[];
}
