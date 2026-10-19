import type { KeyValueStorage } from './key-value-storage';

/** Volatile store used when encryption is unavailable: nothing touches the disk. */
export const createMemoryStorage = (): KeyValueStorage => {
  const values = new Map<string, string>();
  return {
    getItem: (name) => values.get(name) ?? null,
    setItem: (name, value) => {
      values.set(name, value);
    },
    removeItem: (name) => {
      values.delete(name);
    },
  };
};
