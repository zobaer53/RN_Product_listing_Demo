import type { ProductRepository } from '../../domain/repositories/product-repository';
import type { ProductRemoteDataSource } from '../datasources/product-remote.datasource';
import { toProduct, toProductsPage } from '../mappers/product.mapper';

/** Remote-backed repository. Errors are already AppErrors (normalised by the HTTP client). */
export const createProductRepository = (remote: ProductRemoteDataSource): ProductRepository => ({
  getProductsPage: async (request, signal) =>
    toProductsPage(await remote.fetchProductsPage(request, signal)),
  getProductById: async (id, signal) => toProduct(await remote.fetchProductById(id, signal)),
});
