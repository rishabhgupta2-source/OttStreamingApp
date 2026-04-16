import { TMDB_IMAGE_BASE_URL } from '@env';

export type TmdbImageSize = 'w185' | 'w342' | 'w780' | 'original';

export function buildTmdbImageUrl(
  path: string | null,
  size: TmdbImageSize,
): string | null {
  if (path === null || path.length === 0) {
    return null;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/** Alias for UI components — same behavior as {@link buildTmdbImageUrl}. */
export function getImageUrl(
  path: string | null,
  size: TmdbImageSize,
): string | null {
  return buildTmdbImageUrl(path, size);
}
