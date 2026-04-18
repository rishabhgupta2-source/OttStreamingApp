import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getMovieCredits,
  getMovieDetail,
  getSimilarMovies,
} from '../api/movies';
import type { Cast, Movie, MovieDetail } from '../api/types';
import { getErrorMessage } from '../utils/getErrorMessage';

/** Top-billed cast: TMDB `order` ascending, only `order < 10` (never expose full cast list). */
function filterTopBilledCast(cast: Cast[]): Cast[] {
  return [...cast]
    .sort((a, b) => a.order - b.order)
    .filter((member) => member.order < 10);
}

export type UseMovieDetailResult = {
  detail: {
    data: MovieDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
  credits: {
    data: Cast[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
  similar: {
    data: Movie[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
  };
};

/**
 * Detail screen: three parallel TMDB requests with independent loading/error/refetch per section.
 * Initial load uses Promise.allSettled so one failure does not block others.
 */
export function useMovieDetail(movieId: number): UseMovieDetailResult {
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [credits, setCredits] = useState<Cast[]>([]);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  const [similar, setSimilar] = useState<Movie[]>([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [similarError, setSimilarError] = useState<string | null>(null);

  const latestMovieIdRef = useRef(movieId);
  latestMovieIdRef.current = movieId;

  useEffect(() => {
    const id = movieId;
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    setCredits([]);
    setCreditsError(null);
    setCreditsLoading(true);
    setSimilar([]);
    setSimilarError(null);
    setSimilarLoading(true);

    let cancelled = false;

    const loadParallel = async () => {
      const [detailResult, creditsResult, similarResult] =
        await Promise.allSettled([
          getMovieDetail(id),
          getMovieCredits(id),
          getSimilarMovies(id),
        ]);

      if (cancelled || latestMovieIdRef.current !== id) {
        return;
      }

      if (detailResult.status === 'fulfilled') {
        setDetail(detailResult.value);
      } else {
        setDetailError(getErrorMessage(detailResult.reason));
      }
      setDetailLoading(false);

      if (creditsResult.status === 'fulfilled') {
        setCredits(filterTopBilledCast(creditsResult.value.cast));
      } else {
        setCreditsError(getErrorMessage(creditsResult.reason));
      }
      setCreditsLoading(false);

      if (similarResult.status === 'fulfilled') {
        setSimilar(similarResult.value.results);
      } else {
        setSimilarError(getErrorMessage(similarResult.reason));
      }
      setSimilarLoading(false);
    };

    loadParallel().catch(() => {
      /* Promise.allSettled does not reject; unexpected errors are ignored here */
    });

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const refetchDetail = useCallback(() => {
    const id = movieId;
    setDetailLoading(true);
    getMovieDetail(id)
      .then((value) => {
        if (latestMovieIdRef.current !== id) {
          return;
        }
        setDetail(value);
        setDetailError(null);
      })
      .catch((reason: unknown) => {
        if (latestMovieIdRef.current !== id) {
          return;
        }
        setDetail(null);
        setDetailError(getErrorMessage(reason));
      })
      .finally(() => {
        if (latestMovieIdRef.current === id) {
          setDetailLoading(false);
        }
      });
  }, [movieId]);

  const refetchCredits = useCallback(() => {
    const id = movieId;
    setCreditsLoading(true);
    getMovieCredits(id)
      .then((value) => {
        if (latestMovieIdRef.current !== id) {
          return;
        }
        setCredits(filterTopBilledCast(value.cast));
        setCreditsError(null);
      })
      .catch((reason: unknown) => {
        if (latestMovieIdRef.current !== id) {
          return;
        }
        setCredits([]);
        setCreditsError(getErrorMessage(reason));
      })
      .finally(() => {
        if (latestMovieIdRef.current === id) {
          setCreditsLoading(false);
        }
      });
  }, [movieId]);

  const refetchSimilar = useCallback(() => {
    const id = movieId;
    setSimilarLoading(true);
    getSimilarMovies(id)
      .then((value) => {
        if (latestMovieIdRef.current !== id) {
          return;
        }
        setSimilar(value.results);
        setSimilarError(null);
      })
      .catch((reason: unknown) => {
        if (latestMovieIdRef.current !== id) {
          return;
        }
        setSimilar([]);
        setSimilarError(getErrorMessage(reason));
      })
      .finally(() => {
        if (latestMovieIdRef.current === id) {
          setSimilarLoading(false);
        }
      });
  }, [movieId]);

  return useMemo(
    () => ({
      detail: {
        data: detail,
        loading: detailLoading,
        error: detailError,
        refetch: refetchDetail,
      },
      credits: {
        data: credits,
        loading: creditsLoading,
        error: creditsError,
        refetch: refetchCredits,
      },
      similar: {
        data: similar,
        loading: similarLoading,
        error: similarError,
        refetch: refetchSimilar,
      },
    }),
    [
      credits,
      creditsError,
      creditsLoading,
      detail,
      detailError,
      detailLoading,
      refetchCredits,
      refetchDetail,
      refetchSimilar,
      similar,
      similarError,
      similarLoading,
    ],
  );
}
