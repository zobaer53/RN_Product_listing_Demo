import { QueryClient } from '@tanstack/react-query';

import type { AppError } from '@core/errors/app-error';
import { toAppError } from '@core/errors/to-app-error';

import { CACHE_MAX_AGE_MS, STALE_TIME_MS } from '../config/env';
import './register';

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 10_000;

/** Retries transient failures (network, timeout, 5xx) at most twice; never client errors. */
export const shouldRetry = (failureCount: number, error: AppError): boolean => {
  if (failureCount >= MAX_RETRIES) return false;
  const appError = toAppError(error);
  switch (appError.kind) {
    case 'http':
      return appError.isServerError;
    case 'parse':
    case 'validation':
    case 'cancelled':
      return false;
    default:
      return true;
  }
};

/** Exponential back-off: 1s, 2s, 4s… capped at 10s. */
export const retryDelay = (failureCount: number): number =>
  Math.min(BASE_RETRY_DELAY_MS * 2 ** failureCount, MAX_RETRY_DELAY_MS);

/** QueryClient tuned for offline-first: cached data is served first, kept for the cache age. */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: 'offlineFirst',
        staleTime: STALE_TIME_MS,
        gcTime: CACHE_MAX_AGE_MS,
        refetchOnReconnect: true,
        retry: shouldRetry,
        retryDelay,
      },
      mutations: { networkMode: 'offlineFirst' },
    },
  });
