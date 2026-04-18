/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { searchMovies } from '../src/api/movies';
import type { Movie } from '../src/api/types';
import { useSearch } from '../src/hooks/useSearch';

jest.mock('../src/api/movies', () => ({
  searchMovies: jest.fn(),
}));

const mockSearchMovies = searchMovies as jest.MockedFunction<typeof searchMovies>;

const emptyMovieList = {
  page: 1,
  results: [] as Movie[],
  total_pages: 1,
  total_results: 0,
};

const oneResult: Movie = {
  id: 99,
  title: 'Test',
  poster_path: null,
  backdrop_path: null,
  vote_average: 8,
  release_date: '2020-01-01',
  genre_ids: [28],
  overview: '',
};

function mountUseSearch(): {
  getLatest: () => ReturnType<typeof useSearch>;
  unmount: () => void;
} {
  const ref: { current?: ReturnType<typeof useSearch> } = {};
  function Host() {
    ref.current = useSearch();
    return null;
  }
  let root: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(<Host />);
  });
  if (ref.current === undefined) {
    throw new Error('useSearch did not run');
  }
  return {
    getLatest: () => {
      if (ref.current === undefined) {
        throw new Error('useSearch did not run');
      }
      return ref.current;
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
    },
  };
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockSearchMovies.mockReset();
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('clearing query does not call searchMovies', async () => {
  mockSearchMovies.mockResolvedValue(emptyMovieList);
  const { getLatest, unmount } = mountUseSearch();
  jest.useFakeTimers();

  await act(async () => {
    getLatest().setQuery('abc');
  });
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
  await act(async () => {
    await flushMicrotasks();
  });

  const callsAfterSearch = mockSearchMovies.mock.calls.length;

  await act(async () => {
    getLatest().setQuery('');
  });

  expect(mockSearchMovies.mock.calls.length).toBe(callsAfterSearch);

  unmount();
});

test('debounced typing fires a single search for the last query', async () => {
  mockSearchMovies.mockResolvedValue(emptyMovieList);
  const { getLatest, unmount } = mountUseSearch();
  jest.useFakeTimers();

  await act(async () => {
    getLatest().setQuery('a');
  });
  await act(async () => {
    getLatest().setQuery('ab');
  });
  await act(async () => {
    getLatest().setQuery('abc');
  });
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
  await act(async () => {
    await flushMicrotasks();
  });

  expect(mockSearchMovies).toHaveBeenCalledTimes(1);
  expect(mockSearchMovies.mock.calls[0][0]).toBe('abc');

  unmount();
});

test('runSearchNow triggers search immediately without debounce', async () => {
  mockSearchMovies.mockResolvedValue(emptyMovieList);
  const { getLatest, unmount } = mountUseSearch();

  await act(async () => {
    getLatest().runSearchNow('Action');
  });
  await act(async () => {
    await flushMicrotasks();
  });

  expect(mockSearchMovies).toHaveBeenCalledTimes(1);
  expect(mockSearchMovies.mock.calls[0][0]).toBe('Action');
  expect(getLatest().query).toBe('Action');

  unmount();
});

test('recent searches hydrate from AsyncStorage on mount', async () => {
  await AsyncStorage.setItem(
    'streamlist_recent_searches',
    JSON.stringify(['Alpha', 'Beta']),
  );
  const { getLatest, unmount } = mountUseSearch();
  await act(async () => {
    await flushMicrotasks();
  });
  await act(async () => {
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });
  });
  expect(getLatest().recentSearches).toEqual(['Alpha', 'Beta']);
  unmount();
});

test('successful search persists recent term to AsyncStorage', async () => {
  mockSearchMovies.mockResolvedValue({
    ...emptyMovieList,
    results: [oneResult],
    total_results: 1,
  });
  const { getLatest, unmount } = mountUseSearch();

  await act(async () => {
    getLatest().runSearchNow('Neon');
  });
  await act(async () => {
    await flushMicrotasks();
  });

  const raw = await AsyncStorage.getItem('streamlist_recent_searches');
  expect(raw).not.toBeNull();
  const parsed = JSON.parse(raw as string) as unknown;
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed).toContain('Neon');

  unmount();
});

test('clearRecentSearches clears UI and AsyncStorage', async () => {
  mockSearchMovies.mockResolvedValue({
    ...emptyMovieList,
    results: [oneResult],
    total_results: 1,
  });
  const { getLatest, unmount } = mountUseSearch();

  await act(async () => {
    getLatest().runSearchNow('Keep');
    await flushMicrotasks();
    await flushMicrotasks();
  });

  expect(await AsyncStorage.getItem('streamlist_recent_searches')).toContain(
    'Keep',
  );

  await act(async () => {
    await getLatest().clearRecentSearches();
  });

  expect(getLatest().recentSearches).toEqual([]);
  expect(await AsyncStorage.getItem('streamlist_recent_searches')).toBeNull();

  unmount();
});

test('search API error exposes message and clears results', async () => {
  mockSearchMovies.mockRejectedValue(new Error('Network down'));
  const { getLatest, unmount } = mountUseSearch();

  await act(async () => {
    getLatest().runSearchNow('fail');
  });
  await act(async () => {
    await flushMicrotasks();
  });

  expect(getLatest().error).toBe('Network down');
  expect(getLatest().results).toEqual([]);
  expect(getLatest().loading).toBe(false);

  unmount();
});

test('retrySearch invokes search again after error', async () => {
  mockSearchMovies
    .mockRejectedValueOnce(new Error('Temporary'))
    .mockResolvedValueOnce({
      ...emptyMovieList,
      results: [oneResult],
      total_results: 1,
    });
  const { getLatest, unmount } = mountUseSearch();

  await act(async () => {
    getLatest().runSearchNow('retry-me');
  });
  await act(async () => {
    await flushMicrotasks();
  });

  expect(getLatest().error).not.toBeNull();

  await act(async () => {
    getLatest().retrySearch();
  });
  await act(async () => {
    await flushMicrotasks();
  });

  expect(getLatest().error).toBeNull();
  expect(getLatest().results.length).toBe(1);
  expect(mockSearchMovies.mock.calls.length).toBeGreaterThanOrEqual(2);

  unmount();
});
