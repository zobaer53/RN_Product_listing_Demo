import type { Page, PageRequest } from '../entities/page';
import type { ProductSummary } from '../entities/product';
import type { ProductRepository } from '../repositories/product-repository';

export type GetProductsPage = (
  request: PageRequest,
  signal?: AbortSignal,
) => Promise<Page<ProductSummary>>;

/** Loads one page of product summaries. */
export const createGetProductsPage =
  (repository: ProductRepository): GetProductsPage =>
  (request, signal) =>
    repository.getProductsPage(request, signal);
