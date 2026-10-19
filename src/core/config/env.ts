import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'https://dummyjson.com';

/** Bump when the persisted cache shape changes so old caches are discarded. */
const CACHE_SCHEMA_VERSION = 1;

/** Trims whitespace and trailing slashes; falls back to the public API when unset. */
export const normalizeBaseUrl = (value: string | undefined): string => {
  const trimmed = value?.trim().replace(/\/+$/, '');
  return trimmed ? trimmed : DEFAULT_API_BASE_URL;
};

/** Overridable with EXPO_PUBLIC_API_BASE_URL (e.g. the local mock API for E2E). */
export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

export const REQUEST_TIMEOUT_MS = 10_000;
export const STALE_TIME_MS = 5 * 60 * 1000;
export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Persisted cache is dropped whenever the app version or cache schema changes. */
export const CACHE_BUSTER = `${Constants.expoConfig?.version ?? '0.0.0'}-schema${CACHE_SCHEMA_VERSION}`;
