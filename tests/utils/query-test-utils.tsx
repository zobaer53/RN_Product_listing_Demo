import { QueryClient, QueryClientProvider, type QueryObserverOptions } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * QueryClient for tests: no retries and no garbage-collection timers (which would keep Jest
 * alive). Pass query defaults to opt into production behaviour (e.g. offline-first retries).
 */
export const createTestQueryClient = (queries: Partial<QueryObserverOptions> = {}) =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, ...queries },
      mutations: { retry: false },
    },
  });

/** Wrapper for `renderHook` / `render` providing the given client. */
export const createQueryWrapper = (client: QueryClient) => {
  const QueryWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return QueryWrapper;
};
