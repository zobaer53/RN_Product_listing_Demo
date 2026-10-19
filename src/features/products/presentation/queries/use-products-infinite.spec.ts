import { onlineManager } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { makeListItemDto, makeListResponse } from '@tests/fixtures/product-dto-builders';
import { API_BASE_URL } from '@tests/msw/handlers';
import { server } from '@tests/msw/server';
import { createQueryWrapper, createTestQueryClient } from '@tests/utils/query-test-utils';

import { productKeys } from './product-query-keys';
import { useProductsInfinite } from './use-products-infinite';

const renderProducts = (client = createTestQueryClient()) =>
  renderHook(() => useProductsInfinite(), { wrapper: createQueryWrapper(client) });

const serveCatalogue = (total: number) =>
  server.use(
    http.get(`${API_BASE_URL}/products`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      const skip = Number(params.get('skip'));
      const limit = Number(params.get('limit'));
      return HttpResponse.json(makeListResponse({ total, skip, limit }));
    }),
  );

describe('useProductsInfinite', () => {
  it('[HOOK-01] loads the first page of 10 products under the list key', async () => {
    const client = createTestQueryClient();
    const { result } = await renderProducts(client);

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(result.current.data?.products).toHaveLength(10);
    expect(result.current.data?.products[0]?.title).toBe('Essence Mascara Lash Princess');
    expect(result.current.data?.total).toBe(194);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.dataUpdatedAt).toBeGreaterThan(0);
    expect(client.getQueryData(productKeys.list({ limit: 10 }))).toBeDefined();
  });

  it('[HOOK-02] appends pages until the total is reached', async () => {
    serveCatalogue(25);
    const { result } = await renderProducts();
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(() => result.current.fetchNextPage());
    expect(result.current.data?.products).toHaveLength(20);
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());
    expect(result.current.data?.products.map((product) => product.id)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(result.current.data?.total).toBe(25);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('[HOOK-03] never returns duplicate products when pages overlap', async () => {
    server.use(
      http.get(`${API_BASE_URL}/products`, ({ request }) => {
        const skip = Number(new URL(request.url).searchParams.get('skip'));
        // The catalogue shifted between requests: the second page repeats ids 8-10.
        const first = skip === 0 ? 1 : 8;
        const products = Array.from({ length: 10 }, (_, index) => makeListItemDto(first + index));
        return HttpResponse.json({ products, total: 30, skip, limit: 10 });
      }),
    );
    const { result } = await renderProducts();
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(() => result.current.fetchNextPage());

    const ids = result.current.data?.products.map((product) => product.id) ?? [];
    expect(ids).toHaveLength(17);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('[HOOK-04] pauses instead of failing while offline, then resumes on reconnect', async () => {
    server.use(http.get(`${API_BASE_URL}/products`, () => HttpResponse.error()));
    onlineManager.setOnline(false);
    const client = createTestQueryClient({ networkMode: 'offlineFirst', retry: 1, retryDelay: 0 });

    try {
      const { result } = await renderProducts(client);

      await waitFor(() => expect(result.current.fetchStatus).toBe('paused'));
      expect(result.current.status).toBe('pending');
      expect(result.current.error).toBeNull();

      server.resetHandlers();
      await act(() => onlineManager.setOnline(true));
      await waitFor(() => expect(result.current.status).toBe('success'));
      expect(result.current.data?.products).toHaveLength(10);
    } finally {
      onlineManager.setOnline(true);
    }
  });

  it('[HOOK-04] surfaces a typed AppError when the first page fails', async () => {
    server.use(http.get(`${API_BASE_URL}/products`, () => HttpResponse.json({}, { status: 500 })));
    const { result } = await renderProducts();

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.error).toMatchObject({ kind: 'http', status: 500 });
  });
});
