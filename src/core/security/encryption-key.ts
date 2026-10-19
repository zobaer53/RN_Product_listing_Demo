import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/** SecureStore entry holding the cache encryption key. */
export const ENCRYPTION_KEY_NAME = 'product-explorer.cache-key.v1';

/** 24 random bytes encode to exactly 32 base64 chars, the AES-256 key limit of MMKV. */
const KEY_BYTES = 24;

const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

export interface EncryptionKey {
  key: string;
  /** True when the key was generated now, i.e. any existing encrypted data is unreadable. */
  isNew: boolean;
}

/**
 * Returns the cache encryption key, generating and storing it on first run.
 * Resolves to null when the platform keystore is unavailable; callers must then avoid
 * persisting anything to disk.
 */
export const getOrCreateEncryptionKey = async (): Promise<EncryptionKey | null> => {
  try {
    const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME, STORE_OPTIONS);
    if (existing) return { key: existing, isNew: false };

    const key = toBase64(getRandomBytes(KEY_BYTES));
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key, STORE_OPTIONS);
    return { key, isNew: true };
  } catch {
    return null;
  }
};
