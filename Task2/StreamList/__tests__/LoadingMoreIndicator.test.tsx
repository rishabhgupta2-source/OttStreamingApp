/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { LoadingMoreIndicator } from '../src/components/home/LoadingMoreIndicator';

test('LoadingMoreIndicator hidden when not visible', () => {
  const tree = ReactTestRenderer.create(
    <LoadingMoreIndicator visible={false} />,
  );
  expect(tree.toJSON()).toBeNull();
  tree.unmount();
});

test('LoadingMoreIndicator visible', () => {
  ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(
      <LoadingMoreIndicator visible />,
    );
    tree.unmount();
  });
});
