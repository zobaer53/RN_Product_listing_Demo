import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { PersistQueryClientOptions, Persister } from '@tanstack/react-query-persist-client';

import { CACHE_BUSTER, CACHE_MAX_AGE_MS } from '../config/env';
import type { KeyValueStorage } from '../storage/key-value-storage';

/** Storage entry holding the dehydrated query cache. */
export const QUERY_CACHE_KEY = 'product-explorer.query-cache';

const PERSIST_THROTTLE_MS = 1_000;

export const createQueryPersister = (storage: KeyValueStorage): Persister =>
  createAsyncStoragePersister({
    storage,
    key: QUERY_CACHE_KEY,
    throttleTime: PERSIST_THROTTLE_MS,
  });

/** Persistence policy: successful queries only, for at most the cache age, per app version. */
export const persistOptions = {
  maxAge: CACHE_MAX_AGE_MS,
  buster: CACHE_BUSTER,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.state.status === 'success',
  },
} satisfies Omit<PersistQueryClientOptions, 'queryClient' | 'persister'>;

/** Ready-to-use `persistOptions` for `PersistQueryClientProvider`. */
export const createPersistOptions = (
  storage: KeyValueStorage,
): Omit<PersistQueryClientOptions, 'queryClient'> => ({
  ...persistOptions,
  persister: createQueryPersister(storage),
});
