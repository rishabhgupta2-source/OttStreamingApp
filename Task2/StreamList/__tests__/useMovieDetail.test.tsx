/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  getMovieCredits,
  getMovieDetail,
  getSimilarMovies,
} from '../src/api/movies';
import type { Credits, Movie, MovieDetail } from '../src/api/types';
import { useMovieDetail } from '../src/hooks/useMovieDetail';

jest.mock('../src/api/movies', () => ({
  getMovieDetail: jest.fn(),
  getMovieCredits: jest.fn(),
  getSimilarMovies: jest.fn(),
}));

const mockGetMovieDetail = getMovieDetail as jest.MockedFunction<
  typeof getMovieDetail
>;
const mockGetMovieCredits = getMovieCredits as jest.MockedFunction<
  typeof getMovieCredits
>;
const mockGetSimilarMovies = getSimilarMovies as jest.MockedFunction<
  typeof getSimilarMovies
>;

const sampleDetail: MovieDetail = {
  id: 42,
  title: 'Test Film',
  poster_path: null,
  backdrop_path: null,
  vote_average: 7.2,
  release_date: '2020-06-01',
  genres: [{ id: 28, name: 'Action' }],
  runtime: 120,
  overview: 'Overview text.',
};

const emptyCredits: Credits = { id: 42, cast: [] };

const emptySimilar = {
  page: 1,
  results: [] as Movie[],
  total_pages: 1,
  total_results: 0,
};

function mountUseMovieDetail(movieId: number): {
  getLatest: () => ReturnType<typeof useMovieDetail>;
  unmount: () => void;
} {
  const ref: { current?: ReturnType<typeof useMovieDetail> } = {};
  function Host({ id }: { id: number }) {
    ref.current = useMovieDetail(id);
    return null;
  }
  let root: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(<Host id={movieId} />);
  });
  if (ref.current === undefined) {
    throw new Error('useMovieDetail did not run');
  }
  return {
    getLatest: () => {
      if (ref.current === undefined) {
        throw new Error('useMovieDetail did not run');
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

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMovieDetail.mockReset();
  mockGetMovieCredits.mockReset();
  mockGetSimilarMovies.mockReset();
});

test('initial load uses Promise.allSettled and does not chain the three requests', async () => {
  const spy = jest.spyOn(Promise, 'allSettled');
  mockGetMovieDetail.mockResolvedValue(sampleDetail);
  mockGetMovieCredits.mockResolvedValue(emptyCredits);
  mockGetSimilarMovies.mockResolvedValue(emptySimilar);

  const { getLatest, unmount } = mountUseMovieDetail(42);
  await act(async () => {
    await flushMicrotasks();
  });

  expect(spy).toHaveBeenCalled();
  const firstArg = spy.mock.calls[0][0] as unknown[];
  expect(firstArg).toHaveLength(3);
  expect(mockGetMovieDetail).toHaveBeenCalledWith(42);
  expect(mockGetMovieCredits).toHaveBeenCalledWith(42);
  expect(mockGetSimilarMovies).toHaveBeenCalledWith(42);

  expect(getLatest().detail.data).toEqual(sampleDetail);
  expect(getLatest().detail.error).toBeNull();
  expect(getLatest().credits.data).toEqual([]);
  expect(getLatest().similar.data).toEqual([]);

  spy.mockRestore();
  unmount();
});

test('credits rejection does not clear detail data', async () => {
  mockGetMovieDetail.mockResolvedValue(sampleDetail);
  mockGetMovieCredits.mockRejectedValue(new Error('Cast API failed'));
  mockGetSimilarMovies.mockResolvedValue(emptySimilar);

  const { getLatest, unmount } = mountUseMovieDetail(7);
  await act(async () => {
    await flushMicrotasks();
  });

  expect(getLatest().detail.data).toEqual(sampleDetail);
  expect(getLatest().detail.error).toBeNull();
  expect(getLatest().credits.error).toBe('Cast API failed');
  expect(getLatest().credits.data).toEqual([]);

  unmount();
});

test('fulfilled credits with missing cast field yields empty cast list', async () => {
  mockGetMovieDetail.mockResolvedValue(sampleDetail);
  mockGetMovieCredits.mockResolvedValue({ id: 1 } as Credits);
  mockGetSimilarMovies.mockResolvedValue(emptySimilar);

  const { getLatest, unmount } = mountUseMovieDetail(1);
  await act(async () => {
    await flushMicrotasks();
  });

  expect(getLatest().credits.data).toEqual([]);
  expect(getLatest().credits.error).toBeNull();

  unmount();
});

test('fulfilled similar with missing results yields empty similar list', async () => {
  mockGetMovieDetail.mockResolvedValue(sampleDetail);
  mockGetMovieCredits.mockResolvedValue(emptyCredits);
  mockGetSimilarMovies.mockResolvedValue({
    page: 1,
    total_pages: 0,
    total_results: 0,
  } as Awaited<ReturnType<typeof getSimilarMovies>>);

  const { getLatest, unmount } = mountUseMovieDetail(1);
  await act(async () => {
    await flushMicrotasks();
  });

  expect(getLatest().similar.data).toEqual([]);
  expect(getLatest().similar.error).toBeNull();

  unmount();
});
