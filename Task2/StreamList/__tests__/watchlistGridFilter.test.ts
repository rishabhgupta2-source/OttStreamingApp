import { getFilteredWatchlistItems } from '../src/components/watchlist/WatchlistGrid';
import type { WatchlistItem } from '../src/store/watchlistStore';

function item(
  overrides: Partial<WatchlistItem> & Pick<WatchlistItem, 'id' | 'mediaType'>,
): WatchlistItem {
  return {
    title: 'T',
    posterPath: null,
    voteAverage: 0,
    releaseDate: '',
    genreIds: [],
    ...overrides,
  };
}

describe('getFilteredWatchlistItems', () => {
  const items: WatchlistItem[] = [
    item({ id: 1, mediaType: 'movie', title: 'M1' }),
    item({ id: 2, mediaType: 'tv', title: 'S1' }),
    item({ id: 3, mediaType: 'movie', title: 'M2' }),
  ];

  it('returns all items when filter is all', () => {
    expect(getFilteredWatchlistItems(items, 'all')).toEqual(items);
  });

  it('returns only movies when filter is movies', () => {
    const filtered = getFilteredWatchlistItems(items, 'movies');
    expect(filtered.map((i) => i.id)).toEqual([1, 3]);
  });

  it('returns only tv when filter is series', () => {
    const filtered = getFilteredWatchlistItems(items, 'series');
    expect(filtered.map((i) => i.id)).toEqual([2]);
  });
});
