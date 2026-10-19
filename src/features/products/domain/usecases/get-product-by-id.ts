import { AppError } from '@core/errors/app-error';

import type { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product-repository';

export type GetProductById = (id: number, signal?: AbortSignal) => Promise<Product>;

export const isValidProductId = (id: number): boolean => Number.isInteger(id) && id > 0;

/** Loads a full product. Invalid ids are rejected up front, without hitting the repository. */
export const createGetProductById =
  (repository: ProductRepository): GetProductById =>
  async (id, signal) => {
    if (!isValidProductId(id)) {
      throw new AppError('validation', `Invalid product id: ${String(id)}`);
    }
    return repository.getProductById(id, signal);
  };
