/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { GenreChip } from '../src/components/common/GenreChip';

test('GenreChip renders active and inactive', () => {
  ReactTestRenderer.act(() => {
    const a = ReactTestRenderer.create(
      <GenreChip label="All" isActive onPress={() => {}} />,
    );
    a.unmount();
    const b = ReactTestRenderer.create(
      <GenreChip label="Action" isActive={false} onPress={() => {}} />,
    );
    b.unmount();
  });
});
