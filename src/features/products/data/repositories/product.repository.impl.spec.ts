import { http, HttpResponse } from 'msw';

import { AppError } from '@core/errors/app-error';
import { createHttpClient } from '@core/network/http-client';
import { API_BASE_URL } from '@tests/msw/handlers';
import { server } from '@tests/msw/server';

import { createProductRemoteDataSource } from '../datasources/product-remote.datasource';
import { createProductRepository } from './product.repository.impl';

const repository = createProductRepository(
  createProductRemoteDataSource(createHttpClient({ baseUrl: API_BASE_URL, timeoutMs: 1_000 })),
);

describe('product repository', () => {
  it('[DATA-04] returns domain pages and products', async () => {
    const page = await repository.getProductsPage({ limit: 10, skip: 0 });
    const product = await repository.getProductById(1);

    expect(page.items).toHaveLength(10);
    expect(page.items[0]?.thumbnailUrl).toMatch(/thumbnail\.webp$/);
    expect(product.reviews[0]).not.toHaveProperty('reviewerEmail');
  });

  it('[DATA-07] rejects with an http 404 AppError for unknown products', async () => {
    const error: unknown = await repository.getProductById(99999).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ kind: 'http', status: 404, isNotFound: true });
  });

  it('[DATA-02] rejects with a parse AppError when the API returns an invalid payload', async () => {
    server.use(
      http.get(`${API_BASE_URL}/products/:id`, () => HttpResponse.json({ title: 'No id' })),
    );

    const error: unknown = await repository.getProductById(1).catch((e: unknown) => e);

    expect(error).toMatchObject({ kind: 'parse' });
    expect((error as AppError).issues.join()).toContain('id');
  });
});
