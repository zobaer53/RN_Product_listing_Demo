import { API_BASE_URL, CACHE_BUSTER, CACHE_MAX_AGE_MS, normalizeBaseUrl } from './env';

describe('env', () => {
  it('[CORE-ENV-01] defaults the API base URL to dummyjson', () => {
    expect(API_BASE_URL).toBe('https://dummyjson.com');
  });

  it('[CORE-ENV-02] strips trailing slashes from a configured base URL', () => {
    expect(normalizeBaseUrl('http://10.0.2.2:4010//')).toBe('http://10.0.2.2:4010');
    expect(normalizeBaseUrl(undefined)).toBe('https://dummyjson.com');
    expect(normalizeBaseUrl('  ')).toBe('https://dummyjson.com');
  });

  it('[CORE-ENV-03] exposes a deterministic cache buster and a 7 day cache age', () => {
    expect(CACHE_BUSTER).toMatch(/^.+-schema\d+$/);
    expect(CACHE_MAX_AGE_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
