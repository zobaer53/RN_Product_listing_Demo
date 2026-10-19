import { act, renderHook, waitFor } from '@testing-library/react-native';
import { delay, http, HttpResponse } from 'msw';

import product1 from '@tests/fixtures/product-1.json';
import { makeProductSummary } from '@tests/fixtures/product-entities';
import { API_BASE_URL } from '@tests/msw/handlers';
import { server } from '@tests/msw/server';
import { createQueryWrapper, createTestQueryClient } from '@tests/utils/query-test-utils';

import { isFullProduct } from '../screens/view-contracts';
import { productKeys } from './product-query-keys';
import { usePrefetchProduct, useProduct } from './use-product';

const seedList = (client: ReturnType<typeof createTestQueryClient>) =>
  client.setQueryData(productKeys.list({ limit: 10 }), {
    pages: [{ items: [makeProductSummary({ id: 1 })], total: 194, skip: 0, limit: 10 }],
    pageParams: [0],
  });

describe('useProduct', () => {
  it('[HOOK-05] shows the cached summary as placeholder, then the full product', async () => {
    const client = createTestQueryClient();
    seedList(client);
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.get(`${API_BASE_URL}/products/:id`, async () => {
        await released;
        await delay(0);
        return HttpResponse.json(product1);
      }),
    );

    const { result } = await renderHook(() => useProduct(1), {
      wrapper: createQueryWrapper(client),
    });

    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toEqual(makeProductSummary({ id: 1 }));
    expect(result.current.data && isFullProduct(result.current.data)).toBe(false);

    await act(async () => release());
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(result.current.data && isFullProduct(result.current.data)).toBe(true);
    expect(result.current.data).toMatchObject({ id: 1, sku: 'BEA-ESS-ESS-001' });
  });

  it('[HOOK-05] has no placeholder when the product is not in any cached list', async () => {
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.get(`${API_BASE_URL}/products/:id`, async () => {
        await released;
        return HttpResponse.json(product1);
      }),
    );

    const { result } = await renderHook(() => useProduct(1), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPlaceholderData).toBe(false);

    await act(async () => release());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.isPlaceholderData).toBe(false);
  });

  it.each([undefined, 0, -3, 1.5])('[HOOK-05] stays idle for invalid id %p', async (id) => {
    const client = createTestQueryClient();
    const { result } = await renderHook(() => useProduct(id), {
      wrapper: createQueryWrapper(client),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(client.isFetching()).toBe(0);
    const detailQueries = client.getQueryCache().findAll({ queryKey: productKeys.details() });
    expect(detailQueries.every((query) => query.state.dataUpdateCount === 0)).toBe(true);
    expect(detailQueries.every((query) => query.state.errorUpdateCount === 0)).toBe(true);
  });

  it('[HOOK-05] surfaces not-found as an http 404 AppError', async () => {
    const { result } = await renderHook(() => useProduct(99999), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatchObject({ kind: 'http', status: 404, isNotFound: true });
  });
});

describe('usePrefetchProduct', () => {
  it('[HOOK-06] populates the details cache', async () => {
    const client = createTestQueryClient();
    const { result } = await renderHook(() => usePrefetchProduct(), {
      wrapper: createQueryWrapper(client),
    });

    await act(() => result.current(1));

    expect(client.getQueryData(productKeys.detail(1))).toMatchObject({
      id: 1,
      description: expect.any(String),
    });
  });
});
