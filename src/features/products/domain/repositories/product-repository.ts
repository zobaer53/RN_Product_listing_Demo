import type { Page, PageRequest } from '../entities/page';
import type { Product, ProductSummary } from '../entities/product';

/**
 * Port implemented by the data layer. Implementations must reject with AppError only.
 */
export interface ProductRepository {
  getProductsPage(request: PageRequest, signal?: AbortSignal): Promise<Page<ProductSummary>>;
  getProductById(id: number, signal?: AbortSignal): Promise<Product>;
}
