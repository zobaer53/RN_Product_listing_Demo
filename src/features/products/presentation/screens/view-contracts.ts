import type { AppError } from '@core/errors/app-error';

import type { Product, ProductSummary } from '../../domain/entities/product';

/**
 * Contracts between the container screens (which own data fetching) and the
 * presentational views (which only render props). Keeping views pure makes every UI
 * state testable without network or providers.
 */

export type QueryStatus = 'pending' | 'error' | 'success';

export interface ProductListViewProps {
  products: ProductSummary[];
  /** Total number of products on the server, once known. */
  total: number | undefined;
  status: QueryStatus;
  /** Error of the initial load or of a background refresh. */
  error: AppError | null;
  isOnline: boolean;
  isRefreshing: boolean;
  /** Epoch ms of the last successful fetch, 0 if never. */
  dataUpdatedAt: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** Error of the most recent "load more" request. */
  nextPageError: AppError | null;
  onRefresh: () => void;
  onRetry: () => void;
  onEndReached: () => void;
  onRetryNextPage: () => void;
  onPressProduct: (id: number) => void;
  onPressInProduct?: (id: number) => void;
}

export interface ProductDetailsViewProps {
  /** Full product, or the cached summary while details load (see `isPlaceholder`). */
  product: Product | ProductSummary | undefined;
  isPlaceholder: boolean;
  status: QueryStatus;
  error: AppError | null;
  isOnline: boolean;
  /** True when the route param is not a valid product id. */
  isInvalidId: boolean;
  onRetry: () => void;
  onBack: () => void;
}

export const isFullProduct = (product: Product | ProductSummary): product is Product =>
  'description' in product;
