import page0 from './products-page-0.json';

/** API-shaped (DTO) builders for MSW handlers that need custom catalogues. */
export type ListItemDto = (typeof page0.products)[number];

export const makeListItemDto = (id: number): ListItemDto => ({
  ...page0.products[0]!,
  id,
  title: `Product ${id}`,
});

/** A list response for `skip`/`limit` over a catalogue of ids 1..total. */
export const makeListResponse = ({
  total,
  skip,
  limit,
}: {
  total: number;
  skip: number;
  limit: number;
}) => {
  const count = Math.max(0, Math.min(limit, total - skip));
  const products = Array.from({ length: count }, (_, index) => makeListItemDto(skip + index + 1));
  return { products, total, skip, limit };
};
