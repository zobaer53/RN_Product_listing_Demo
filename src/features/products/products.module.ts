import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@core/config/env';
import { createHttpClient, type HttpClient } from '@core/network/http-client';

import { createProductRemoteDataSource } from './data/datasources/product-remote.datasource';
import { createProductRepository } from './data/repositories/product.repository.impl';
import { createGetProductById, type GetProductById } from './domain/usecases/get-product-by-id';
import { createGetProductsPage, type GetProductsPage } from './domain/usecases/get-products-page';

/** The products feature's use cases, wired to their data sources (composition root). */
export interface ProductsModule {
  getProductsPage: GetProductsPage;
  getProductById: GetProductById;
}

export const createProductsModule = (httpClient: HttpClient): ProductsModule => {
  const repository = createProductRepository(createProductRemoteDataSource(httpClient));
  return {
    getProductsPage: createGetProductsPage(repository),
    getProductById: createGetProductById(repository),
  };
};

export const productsModule = createProductsModule(
  createHttpClient({ baseUrl: API_BASE_URL, timeoutMs: REQUEST_TIMEOUT_MS }),
);
