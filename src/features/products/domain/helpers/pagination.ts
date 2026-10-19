import type { Page } from '../entities/page';

/** Page size used by the brief's endpoint (`/products?limit=10`). */
export const PAGE_SIZE = 10;

/** Offset of the next page, or `undefined` when the last page has been loaded. */
export const nextSkip = ({
  skip,
  limit,
  total,
}: Pick<Page<unknown>, 'skip' | 'limit' | 'total'>) => {
  const next = skip + limit;
  return next < total ? next : undefined;
};

/** Flattens loaded pages in order, keeping the first occurrence of each id. */
export const mergePages = <T extends { id: number }>(pages: readonly Page<T>[]): T[] => {
  const seen = new Set<number>();
  const merged: T[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
};
