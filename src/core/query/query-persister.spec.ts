import {
  persistQueryClientRestore,
  persistQueryClientSave,
} from '@tanstack/react-query-persist-client';
import { QueryClient } from '@tanstack/react-query';

import { AppError } from '@core/errors/app-error';

import { createMemoryStorage } from '../storage/memory-storage';
import type { KeyValueStorage } from '../storage/key-value-storage';
import { createPersistOptions, persistOptions, QUERY_CACHE_KEY } from './query-persister';

const listKey = ['products', 'list', { limit: 10 }];
const detailKey = ['products', 'detail', 1];
const infiniteData = {
  pages: [{ items: [{ id: 1, title: 'One' }], total: 1, skip: 0, limit: 10 }],
  pageParams: [0],
};

const newClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

const save = (queryClient: QueryClient, storage: KeyValueStorage) =>
  persistQueryClientSave({ queryClient, ...createPersistOptions(storage) });

const restore = (queryClient: QueryClient, storage: KeyValueStorage, buster?: string) =>
  persistQueryClientRestore({
    queryClient,
    ...createPersistOptions(storage),
    ...(buster === undefined ? {} : { buster }),
  });

describe('query persister', () => {
  it('[CORE-QRY-02] round-trips list (infinite) and detail queries into a fresh client', async () => {
    const storage = createMemoryStorage();
    const source = newClient();
    await source.prefetchInfiniteQuery({
      queryKey: listKey,
      queryFn: () => infiniteData.pages[0],
      initialPageParam: 0,
    });
    await source.prefetchQuery({ queryKey: detailKey, queryFn: () => ({ id: 1, title: 'One' }) });

    await save(source, storage);
    const target = newClient();
    await restore(target, storage);

    expect(storage.getItem(QUERY_CACHE_KEY)).not.toBeNull();
    expect(target.getQueryData(listKey)).toEqual(infiniteData);
    expect(target.getQueryData(detailKey)).toEqual({ id: 1, title: 'One' });
    expect(persistOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('[CORE-QRY-03] never persists failed queries', async () => {
    const storage = createMemoryStorage();
    const source = newClient();
    await source.prefetchQuery({ queryKey: detailKey, queryFn: () => ({ id: 1 }) });
    await source.prefetchQuery({
      queryKey: ['products', 'detail', 2],
      queryFn: () => Promise.reject(new AppError('http', 'Not found', { status: 404 })),
    });

    await save(source, storage);
    const target = newClient();
    await restore(target, storage);

    expect(source.getQueryState(['products', 'detail', 2])?.status).toBe('error');
    expect(target.getQueryState(['products', 'detail', 2])).toBeUndefined();
    expect(storage.getItem(QUERY_CACHE_KEY)).not.toContain('Not found');
    expect(target.getQueryData(detailKey)).toEqual({ id: 1 });
  });

  it('[CORE-QRY-04] discards a cache persisted with a different buster', async () => {
    const storage = createMemoryStorage();
    const source = newClient();
    await source.prefetchQuery({ queryKey: detailKey, queryFn: () => ({ id: 1 }) });

    await save(source, storage);
    const target = newClient();
    await restore(target, storage, 'another-version');

    expect(target.getQueryData(detailKey)).toBeUndefined();
    expect(storage.getItem(QUERY_CACHE_KEY)).toBeNull();
  });
});
