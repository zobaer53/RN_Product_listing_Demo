import { createMMKV, deleteMMKV, existsMMKV } from 'react-native-mmkv';

import { getOrCreateEncryptionKey } from '../security/encryption-key';
import type { KeyValueStorage } from './key-value-storage';

/** MMKV instance id of the offline query cache. */
export const CACHE_STORAGE_ID = 'product-explorer.cache';

export interface EncryptedStorageConfig {
  id: string;
  key: string;
  /** A new key cannot read data written with a lost one, so the old store is wiped first. */
  isNewKey: boolean;
}

/** AES-256 encrypted MMKV store. */
export const createEncryptedStorage = ({
  id,
  key,
  isNewKey,
}: EncryptedStorageConfig): KeyValueStorage => {
  if (isNewKey && existsMMKV(id)) deleteMMKV(id);

  const mmkv = createMMKV({ id, encryptionKey: key, encryptionType: 'AES-256' });
  return {
    getItem: (name) => mmkv.getString(name) ?? null,
    setItem: (name, value) => mmkv.set(name, value),
    removeItem: (name) => {
      mmkv.remove(name);
    },
  };
};

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

export interface SecureCacheStorage {
  storage: KeyValueStorage;
  /** False when the cache only lives in memory for this session. */
  encrypted: boolean;
}

/** Opens the encrypted cache store, or an in-memory one if no key can be obtained. */
export const openSecureCacheStorage = async (): Promise<SecureCacheStorage> => {
  const encryptionKey = await getOrCreateEncryptionKey();
  if (!encryptionKey) return { storage: createMemoryStorage(), encrypted: false };

  try {
    const storage = createEncryptedStorage({
      id: CACHE_STORAGE_ID,
      key: encryptionKey.key,
      isNewKey: encryptionKey.isNew,
    });
    return { storage, encrypted: true };
  } catch {
    return { storage: createMemoryStorage(), encrypted: false };
  }
};
