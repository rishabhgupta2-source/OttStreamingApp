/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { GenreFilterStrip } from '../src/components/home/GenreFilterStrip';
import type { Genre } from '../src/api/types';

const sampleGenres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
];

test('GenreFilterStrip renders loading skeletons then genres', () => {
  ReactTestRenderer.act(() => {
    const loading = ReactTestRenderer.create(
      <GenreFilterStrip
        genres={[]}
        loading
        selectedGenreId={null}
        onSelectGenre={() => {}}
      />,
    );
    loading.unmount();
    const loaded = ReactTestRenderer.create(
      <GenreFilterStrip
        genres={sampleGenres}
        loading={false}
        selectedGenreId={28}
        onSelectGenre={() => {}}
      />,
    );
    loaded.unmount();
  });
});
