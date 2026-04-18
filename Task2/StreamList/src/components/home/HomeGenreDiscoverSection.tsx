import { useCallback } from 'react';
import { getDiscoverByGenre } from '../../api/movies';
import { usePaginatedMovieList } from '../../hooks/usePaginatedMovieList';
import type { GenreNameMap } from '../common/ContentCard';
import { ContentRow } from './ContentRow';

export type HomeGenreDiscoverSectionProps = {
  genreId: number;
  title: string;
  genreMap: GenreNameMap;
  onCardPress: (movieId: number) => void;
};

/**
 * One discover-by-genre horizontal row; owns its paginated hook (rules-compliant hook per row).
 */
export function HomeGenreDiscoverSection({
  genreId,
  title,
  genreMap,
  onCardPress,
}: HomeGenreDiscoverSectionProps) {
  const fetchPage = useCallback(
    (page: number) => getDiscoverByGenre(genreId, page),
    [genreId],
  );

  const row = usePaginatedMovieList(String(genreId), fetchPage);

  return (
    <ContentRow
      data={row.data}
      genreMap={genreMap}
      hasMore={row.hasMore}
      loadMore={row.loadMore}
      loading={row.loading}
      onCardPress={onCardPress}
      title={title}
    />
  );
}
