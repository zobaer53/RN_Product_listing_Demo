import {
  queryOptions,
  skipToken,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import type { Page } from '../../domain/entities/page';
import type { Product, ProductSummary } from '../../domain/entities/product';
import { isValidProductId } from '../../domain/usecases/get-product-by-id';
import { productsModule } from '../../products.module';
import { productKeys } from './product-query-keys';

/** Detail data: the full product, or a list summary while it loads (placeholder). */
export type ProductDetailData = Product | ProductSummary;

export const productDetailQueryOptions = (id: number) =>
  queryOptions<ProductDetailData>({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => productsModule.getProductById(id, signal),
  });

/** Finds a product summary in any cached list page. */
export const findCachedSummary = (
  queryClient: QueryClient,
  id: number,
): ProductSummary | undefined => {
  const lists = queryClient.getQueriesData<InfiniteData<Page<ProductSummary>>>({
    queryKey: productKeys.lists(),
  });
  for (const [, data] of lists) {
    for (const page of data?.pages ?? []) {
      const match = page.items.find((item) => item.id === id);
      if (match) return match;
    }
  }
  return undefined;
};

/**
 * Product details. While loading, `data` is the summary from the list cache (if any) and
 * `isPlaceholderData` is true. Disabled (idle) for missing or invalid ids.
 */
export const useProduct = (id: number | undefined) => {
  const queryClient = useQueryClient();
  const validId = id !== undefined && isValidProductId(id) ? id : undefined;

  return useQuery({
    ...productDetailQueryOptions(validId ?? 0),
    queryFn:
      validId === undefined
        ? skipToken
        : ({ signal }) => productsModule.getProductById(validId, signal),
    placeholderData: () =>
      validId === undefined ? undefined : findCachedSummary(queryClient, validId),
  });
};

/** Returns a function that warms the details cache (e.g. on press-in). */
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  return useCallback(
    async (id: number) => {
      if (!isValidProductId(id)) return;
      await queryClient.prefetchQuery(productDetailQueryOptions(id));
    },
    [queryClient],
  );
};
