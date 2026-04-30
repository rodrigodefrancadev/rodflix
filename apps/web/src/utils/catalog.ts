import type { CatalogItem } from '../api/catalog';

/**
 * Checks if a CatalogItem is considered 'watched' based on the watchedIds set.
 * For films, it checks the existingId.
 * For series, it checks if the first episode of the first season is watched.
 */
export const isItemWatched = (item: CatalogItem, watchedIds: Set<string>): boolean => {
  if (item.kind === 'film') {
    return watchedIds.has(item.existingId);
  }
  
  if (item.kind === 'series' && item.seasons[0]?.episodes[0]) {
    return watchedIds.has(item.seasons[0].episodes[0].driveFileId);
  }

  return false;
};
