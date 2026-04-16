/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SkeletonCard } from '../src/components/common/SkeletonCard';

test('SkeletonCard renders without crashing', () => {
  ReactTestRenderer.act(() => {
    const a = ReactTestRenderer.create(<SkeletonCard />);
    a.unmount();
    const b = ReactTestRenderer.create(<SkeletonCard width={120} />);
    b.unmount();
    const c = ReactTestRenderer.create(
      <SkeletonCard
        posterHeight={100}
        showCaptionSkeletons={false}
        width={200}
      />,
    );
    c.unmount();
  });
});
