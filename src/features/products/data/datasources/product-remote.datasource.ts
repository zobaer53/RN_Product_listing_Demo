import type { HttpClient } from '@core/network/http-client';

import type { PageRequest } from '../../domain/entities/page';
import {
  PRODUCT_LIST_FIELDS,
  productDtoSchema,
  productListDtoSchema,
  type ProductDto,
  type ProductListDto,
} from '../dto/product.dto';

export interface ProductRemoteDataSource {
  fetchProductsPage(request: PageRequest, signal?: AbortSignal): Promise<ProductListDto>;
  fetchProductById(id: number, signal?: AbortSignal): Promise<ProductDto>;
}

/** dummyjson.com product endpoints; responses are validated against the DTO schemas. */
export const createProductRemoteDataSource = (http: HttpClient): ProductRemoteDataSource => ({
  fetchProductsPage: ({ limit, skip }, signal) =>
    http.get('/products', {
      schema: productListDtoSchema,
      query: { limit, skip, select: PRODUCT_LIST_FIELDS },
      signal,
    }),
  fetchProductById: (id, signal) =>
    http.get(`/products/${encodeURIComponent(String(id))}`, { schema: productDtoSchema, signal }),
});
