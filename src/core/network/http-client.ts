import type { ZodType } from 'zod';

import { AppError } from '@core/errors/app-error';
import { toAppError } from '@core/errors/to-app-error';

export type QueryParams = Record<string, string | number | undefined>;

export interface RequestOptions<T> {
  /** Validates (and types) the JSON body. Without it the body is returned as-is. */
  schema?: ZodType<T>;
  query?: QueryParams;
  signal?: AbortSignal;
}

export interface HttpClient {
  /** GETs a JSON resource. Rejects with AppError only. */
  get<T = unknown>(path: string, options?: RequestOptions<T>): Promise<T>;
}

export interface HttpClientConfig {
  baseUrl: string;
  timeoutMs: number;
  fetchFn?: typeof fetch;
  /** Allows plain HTTP to any host. Defaults to dev builds only. */
  allowInsecure?: boolean;
}

/** Hosts used by the local mock API (Android emulator, iOS simulator). */
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

const hostOf = (url: string): string => /^[a-z]+:\/\/([^/:?#]+)/i.exec(url)?.[1] ?? '';

/** HTTPS is required, except for loopback hosts or when explicitly allowed (dev). */
export const isAllowedBaseUrl = (baseUrl: string, allowInsecure: boolean): boolean =>
  baseUrl.startsWith('https://') ||
  (baseUrl.startsWith('http://') && (allowInsecure || LOOPBACK_HOSTS.has(hostOf(baseUrl))));

const buildUrl = (baseUrl: string, path: string, query: QueryParams = {}): string => {
  const params = Object.entries(query)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length > 0 ? `${baseUrl}${path}?${params.join('&')}` : `${baseUrl}${path}`;
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new AppError('parse', 'Malformed response', { cause: error });
  }
};

/**
 * Minimal JSON-over-HTTP client: per-request deadline merged with the caller's signal,
 * schema validation and AppError-only rejections. Payloads are never logged.
 */
export const createHttpClient = ({
  baseUrl,
  timeoutMs,
  // Resolved per call so later patches of the global (interceptors, polyfills) are honoured.
  fetchFn = (input, init) => fetch(input, init),
  allowInsecure = __DEV__,
}: HttpClientConfig): HttpClient => {
  if (!isAllowedBaseUrl(baseUrl, allowInsecure)) {
    throw new Error('API base URL must use HTTPS');
  }

  const get = async <T>(path: string, { schema, query, signal }: RequestOptions<T> = {}) => {
    if (signal?.aborted) throw new AppError('cancelled', 'Request cancelled');

    // Manual merge: AbortSignal.any/timeout are not available on every JS engine we ship to.
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const onCallerAbort = () => controller.abort();
    signal?.addEventListener('abort', onCallerAbort);

    try {
      const response = await fetchFn(buildUrl(baseUrl, path, query), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new AppError('http', `Request failed with status ${response.status}`, {
          status: response.status,
        });
      }
      const body = parseJson(await response.text());
      if (!schema) return body as T;

      const result = schema.safeParse(body);
      if (!result.success) throw toAppError(result.error);
      return result.data;
    } catch (error) {
      if (timedOut) throw new AppError('timeout', 'Request timed out', { cause: error });
      if (signal?.aborted) throw new AppError('cancelled', 'Request cancelled', { cause: error });
      throw toAppError(error);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onCallerAbort);
    }
  };

  return { get };
};
