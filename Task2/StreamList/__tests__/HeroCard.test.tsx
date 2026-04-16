/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { HeroCard } from '../src/components/home/HeroCard';
import type { Movie } from '../src/api/types';

const sampleMovie: Movie = {
  id: 99,
  title: 'Neon Drift',
  poster_path: null,
  backdrop_path: null,
  vote_average: 8.1,
  release_date: '2024-01-01',
  genre_ids: [28],
  overview: 'A test synopsis that runs long enough to wrap across two lines in the hero card layout.',
};

test('HeroCard loading and loaded states', () => {
  ReactTestRenderer.act(() => {
    const loading = ReactTestRenderer.create(
      <HeroCard movie={null} onDetailsPress={() => {}} />,
    );
    loading.unmount();
    const loaded = ReactTestRenderer.create(
      <HeroCard movie={sampleMovie} onDetailsPress={() => {}} />,
    );
    loaded.unmount();
  });
});

test('HeroCard omits synopsis when overview is empty', () => {
  ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(
      <HeroCard
        movie={{ ...sampleMovie, overview: '   ' }}
        onDetailsPress={() => {}}
      />,
    );
    tree.unmount();
  });
});
