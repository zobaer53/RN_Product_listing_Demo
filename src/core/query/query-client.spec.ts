import { AppError, type AppErrorKind } from '@core/errors/app-error';

import { CACHE_MAX_AGE_MS, STALE_TIME_MS } from '../config/env';
import { createQueryClient, retryDelay, shouldRetry } from './query-client';

const error = (kind: AppErrorKind, status?: number) => new AppError(kind, kind, { status });

describe('query client', () => {
  it.each([
    ['network', undefined, true],
    ['timeout', undefined, true],
    ['offline', undefined, true],
    ['unknown', undefined, true],
    ['http', 500, true],
    ['http', 503, true],
    ['http', 404, false],
    ['http', 429, false],
    ['parse', undefined, false],
    ['validation', undefined, false],
    ['cancelled', undefined, false],
  ] as const)('[CORE-QRY-01] %s %s retryable: %s', (kind, status, retryable) => {
    expect(shouldRetry(0, error(kind, status))).toBe(retryable);
    expect(shouldRetry(1, error(kind, status))).toBe(retryable);
    // Never more than two retries.
    expect(shouldRetry(2, error(kind, status))).toBe(false);
  });

  it('[CORE-QRY-01] retries non-AppErrors as unknown and backs off exponentially with a cap', () => {
    expect(shouldRetry(0, new Error('boom') as AppError)).toBe(true);
    expect(retryDelay(0)).toBe(1_000);
    expect(retryDelay(1)).toBe(2_000);
    expect(retryDelay(10)).toBe(10_000);
  });

  it('[CORE-QRY-01] configures offline-first defaults', () => {
    const queries = createQueryClient().getDefaultOptions().queries;

    expect(queries).toMatchObject({
      networkMode: 'offlineFirst',
      staleTime: STALE_TIME_MS,
      gcTime: CACHE_MAX_AGE_MS,
      refetchOnReconnect: true,
      retry: shouldRetry,
      retryDelay,
    });
  });
});
