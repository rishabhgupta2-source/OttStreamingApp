import { useCallback, useEffect, useRef, useState } from 'react';
import type { AsyncResource } from './asyncResourceTypes';
import { getErrorMessage } from '../utils/getErrorMessage';

type DependencyList = ReadonlyArray<unknown>;

/**
 * Single async resource: standard { data, loading, error, refetch } contract.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  initialData: T,
  suppressErrorOnFailure = false,
): AsyncResource<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestGen = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  const refetch = useCallback(() => {
    const myGen = ++requestGen.current;
    setLoading(true);
    setError(null);
    void fetcherRef
      .current()
      .then((next) => {
        if (requestGen.current !== myGen) {
          return;
        }
        setData(next);
      })
      .catch((e) => {
        if (requestGen.current !== myGen) {
          return;
        }
        if (suppressErrorOnFailure) {
          setData(initialDataRef.current);
          setError(null);
        } else {
          setError(getErrorMessage(e));
        }
      })
      .finally(() => {
        if (requestGen.current !== myGen) {
          return;
        }
        setLoading(false);
      });
  }, [suppressErrorOnFailure]);

  useEffect(() => {
    refetch();
  }, [...deps, refetch]);

  return { data, loading, error, refetch };
}
