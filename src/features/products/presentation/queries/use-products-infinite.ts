import { infiniteQueryOptions, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import type { Page } from '../../domain/entities/page';
import type { ProductSummary } from '../../domain/entities/product';
import { mergePages, nextSkip, PAGE_SIZE } from '../../domain/helpers/pagination';
import { productsModule } from '../../products.module';
import { productKeys } from './product-query-keys';

export interface ProductListData {
  /** Loaded products in order, without duplicates across pages. */
  products: ProductSummary[];
  /** Total number of products on the server. */
  total: number;
}

export const selectProductList = (data: InfiniteData<Page<ProductSummary>>): ProductListData => ({
  products: mergePages(data.pages),
  total: data.pages.at(-1)?.total ?? 0,
});

export const productsInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: productKeys.list({ limit: PAGE_SIZE }),
    queryFn: ({ pageParam, signal }) =>
      productsModule.getProductsPage({ limit: PAGE_SIZE, skip: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => nextSkip(lastPage),
  });

/**
 * Paginated product list. `data` is `{ products, total }`; the rest is TanStack's infinite
 * query result (status, error, hasNextPage, fetchNextPage, isFetchNextPageError, refetch…).
 */
export const useProductsInfinite = () =>
  useInfiniteQuery({ ...productsInfiniteQueryOptions(), select: selectProductList });
