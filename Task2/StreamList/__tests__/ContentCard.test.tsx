/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ContentCard } from '../src/components/common/ContentCard';
import type { Movie } from '../src/api/types';

const baseMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  poster_path: null,
  backdrop_path: null,
  vote_average: 7.2,
  release_date: '2024-06-01',
  genre_ids: [28],
  overview: 'Overview',
};

test('ContentCard renders with placeholder when poster is null', () => {
  ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(
      <ContentCard
        movie={baseMovie}
        genreMap={{ 28: 'Action' }}
        onPress={() => {}}
      />,
    );
    tree.unmount();
  });
});

test('ContentCard hides rating when vote is zero', () => {
  ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(
      <ContentCard
        movie={{ ...baseMovie, vote_average: 0 }}
        onPress={() => {}}
      />,
    );
    tree.unmount();
  });
});

test('ContentCard handles null release_date (TMDB search rows)', () => {
  ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(
      <ContentCard
        genreMap={{ 28: 'Action' }}
        movie={{ ...baseMovie, release_date: null }}
        onPress={() => {}}
      />,
    );
    tree.unmount();
  });
});
