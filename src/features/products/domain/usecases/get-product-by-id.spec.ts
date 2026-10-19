import { AppError } from '@core/errors/app-error';
import { makeProduct } from '@tests/fixtures/product-entities';

import type { ProductRepository } from '../repositories/product-repository';
import { createGetProductById } from './get-product-by-id';

const makeRepository = (): jest.Mocked<ProductRepository> => ({
  getProductsPage: jest.fn(),
  getProductById: jest.fn(),
});

describe('getProductById', () => {
  it('[DOM-06] returns the product for a valid id', async () => {
    const repository = makeRepository();
    const product = makeProduct({ id: 3 });
    repository.getProductById.mockResolvedValue(product);
    const signal = new AbortController().signal;

    await expect(createGetProductById(repository)(3, signal)).resolves.toBe(product);
    expect(repository.getProductById).toHaveBeenCalledWith(3, signal);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    '[DOM-06] rejects invalid id %p with a validation error without calling the repository',
    async (id) => {
      const repository = makeRepository();

      const promise = createGetProductById(repository)(id);

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({ kind: 'validation' });
      expect(repository.getProductById).not.toHaveBeenCalled();
    },
  );
});
