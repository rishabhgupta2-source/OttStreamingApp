/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SearchResultsGrid } from '../src/components/search/SearchResultsGrid';
import type { Movie } from '../src/api/types';

const sampleMovie: Movie = {
  id: 1,
  title: 'Found',
  poster_path: '/p.jpg',
  backdrop_path: null,
  vote_average: 7,
  release_date: '2021-01-01',
  genre_ids: [28],
  overview: '',
};

test('SearchResultsGrid shows designed empty state when zero results', () => {
  let root: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(
      <SearchResultsGrid
        error={null}
        loading={false}
        onCardPress={() => {}}
        onRetry={() => {}}
        query="noresultsxyz"
        results={[]}
        totalResults={0}
      />,
    );
  });
  const json = root!.toJSON();
  const flat = JSON.stringify(json);
  expect(flat).toContain('No results for');
  expect(flat).not.toContain('Retry');
  act(() => {
    root!.unmount();
  });
});

test('SearchResultsGrid shows error and retry instead of empty grid', () => {
  let root: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(
      <SearchResultsGrid
        error="Something went wrong"
        loading={false}
        onCardPress={() => {}}
        onRetry={() => {}}
        query="q"
        results={[]}
        totalResults={0}
      />,
    );
  });
  const json = root!.toJSON();
  const flat = JSON.stringify(json);
  expect(flat).toContain('Something went wrong');
  expect(flat).toContain('Retry');
  expect(flat).not.toContain('No results for');
  act(() => {
    root!.unmount();
  });
});

test('SearchResultsGrid shows grid when results exist', () => {
  let root: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    root = ReactTestRenderer.create(
      <SearchResultsGrid
        error={null}
        loading={false}
        onCardPress={() => {}}
        onRetry={() => {}}
        query="q"
        results={[sampleMovie]}
        totalResults={1}
      />,
    );
  });
  const json = root!.toJSON();
  const flat = JSON.stringify(json);
  expect(flat).toContain('1 results for');
  expect(flat).toContain('Found');
  act(() => {
    root!.unmount();
  });
});
