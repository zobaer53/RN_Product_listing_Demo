import type { AsyncKeyValueStorage, KeyValueStorage } from './key-value-storage';

/**
 * Storage usable immediately while the real store is still opening (the encryption key
 * comes from the keychain asynchronously). Every call waits for `ready`.
 */
export const createDeferredStorage = (ready: Promise<KeyValueStorage>): AsyncKeyValueStorage => ({
  getItem: async (key) => (await ready).getItem(key),
  setItem: async (key, value) => (await ready).setItem(key, value),
  removeItem: async (key) => (await ready).removeItem(key),
});
