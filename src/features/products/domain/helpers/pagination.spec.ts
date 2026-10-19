import { mergePages, nextSkip, PAGE_SIZE } from './pagination';

const page = (skip: number, ids: number[], total = 194) => ({
  items: ids.map((id) => ({ id })),
  total,
  skip,
  limit: PAGE_SIZE,
});

describe('pagination', () => {
  it('uses the page size from the brief', () => {
    expect(PAGE_SIZE).toBe(10);
  });

  it('[DOM-03] returns the next skip while more items exist', () => {
    expect(nextSkip({ skip: 0, limit: 10, total: 194 })).toBe(10);
    expect(nextSkip({ skip: 180, limit: 10, total: 194 })).toBe(190);
  });

  it('[DOM-04] returns undefined on the last page', () => {
    expect(nextSkip({ skip: 190, limit: 10, total: 194 })).toBeUndefined();
    expect(nextSkip({ skip: 0, limit: 10, total: 10 })).toBeUndefined();
    expect(nextSkip({ skip: 0, limit: 10, total: 0 })).toBeUndefined();
  });

  it('[HOOK-03] flattens pages in order and drops duplicate ids', () => {
    const merged = mergePages([page(0, [1, 2, 3]), page(10, [3, 4])]);
    expect(merged.map((item) => item.id)).toEqual([1, 2, 3, 4]);
  });

  it('returns an empty list for no pages', () => {
    expect(mergePages([])).toEqual([]);
  });
});
