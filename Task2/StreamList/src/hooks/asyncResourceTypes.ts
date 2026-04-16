import type { Movie } from '../api/types';

export type AsyncResource<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export type PaginatedMovieListResource = AsyncResource<Movie[]> & {
  loadMore: () => void;
  hasMore: boolean;
};
