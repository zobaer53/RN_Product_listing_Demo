import { makeProductSummaries } from '@tests/fixtures/product-entities';

import type { ProductRepository } from '../repositories/product-repository';
import { createGetProductsPage } from './get-products-page';

describe('getProductsPage', () => {
  it('[DOM-05] delegates the page request and signal to the repository', async () => {
    const page = { items: makeProductSummaries(10), total: 194, skip: 0, limit: 10 };
    const repository: jest.Mocked<ProductRepository> = {
      getProductsPage: jest.fn().mockResolvedValue(page),
      getProductById: jest.fn(),
    };
    const signal = new AbortController().signal;

    const result = await createGetProductsPage(repository)({ limit: 10, skip: 0 }, signal);

    expect(result).toBe(page);
    expect(repository.getProductsPage).toHaveBeenCalledWith({ limit: 10, skip: 0 }, signal);
  });
});
