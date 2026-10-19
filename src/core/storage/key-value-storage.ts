/** Synchronous string key-value store (compatible with TanStack's persister storage). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Asynchronous variant, e.g. a store that is still being opened. */
export interface AsyncKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Any store the query cache can be persisted to. */
export type PersistableStorage = KeyValueStorage | AsyncKeyValueStorage;
