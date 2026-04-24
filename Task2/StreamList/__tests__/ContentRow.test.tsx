/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ContentRow } from '../src/components/home/ContentRow';
import type { Movie } from '../src/api/types';

const movie: Movie = {
  id: 1,
  title: 'A',
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  release_date: '2024-01-01',
  genre_ids: [28],
  overview: '',
};

test('ContentRow skeleton, list, and empty states', () => {
  ReactTestRenderer.act(() => {
    const skeleton = ReactTestRenderer.create(
      <ContentRow
        data={[]}
        hasMore
        loading
        loadMore={() => {}}
        onCardPress={() => {}}
        title="Trending"
      />,
    );
    skeleton.unmount();

    const list = ReactTestRenderer.create(
      <ContentRow
        data={[movie]}
        hasMore={false}
        loading={false}
        loadMore={() => {}}
        onCardPress={() => {}}
        title="Trending"
      />,
    );
    list.unmount();

    const empty = ReactTestRenderer.create(
      <ContentRow
        data={[]}
        hasMore={false}
        loading={false}
        loadMore={() => {}}
        onCardPress={() => {}}
        title="Trending"
      />,
    );
    empty.unmount();

    const loadFailed = ReactTestRenderer.create(
      <ContentRow
        data={[]}
        error="Request failed"
        hasMore={false}
        loading={false}
        loadMore={() => {}}
        onCardPress={() => {}}
        onRetry={() => {}}
        title="Trending"
      />,
    );
    loadFailed.unmount();

    const partialError = ReactTestRenderer.create(
      <ContentRow
        data={[movie]}
        error="Could not load next page"
        hasMore={false}
        loading={false}
        loadMore={() => {}}
        onCardPress={() => {}}
        onRetry={() => {}}
        title="Trending"
      />,
    );
    partialError.unmount();
  });
});
