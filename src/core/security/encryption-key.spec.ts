import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { ENCRYPTION_KEY_NAME, getOrCreateEncryptionKey } from './encryption-key';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn((count: number) => Uint8Array.from({ length: count }, (_, i) => i)),
}));

const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);
const getRandomBytes = jest.mocked(Crypto.getRandomBytes);

describe('getOrCreateEncryptionKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('[CORE-SEC-01] creates a 32-char key on first run and stores it device-only', async () => {
    getItemAsync.mockResolvedValue(null);
    setItemAsync.mockResolvedValue(undefined);

    const result = await getOrCreateEncryptionKey();

    expect(result).not.toBeNull();
    expect(result?.isNew).toBe(true);
    expect(result?.key).toHaveLength(32);
    expect(getRandomBytes).toHaveBeenCalledWith(24);
    expect(setItemAsync).toHaveBeenCalledWith(ENCRYPTION_KEY_NAME, result?.key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  });

  it('[CORE-SEC-02] reuses an existing key and never regenerates it', async () => {
    const existing = 'A'.repeat(32);
    getItemAsync.mockResolvedValue(existing);

    const result = await getOrCreateEncryptionKey();

    expect(result).toEqual({ key: existing, isNew: false });
    expect(getRandomBytes).not.toHaveBeenCalled();
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  it('[CORE-SEC-03] returns null instead of crashing when the secure store fails', async () => {
    getItemAsync.mockRejectedValue(new Error('keychain unavailable'));
    await expect(getOrCreateEncryptionKey()).resolves.toBeNull();

    getItemAsync.mockResolvedValue(null);
    setItemAsync.mockRejectedValue(new Error('keychain locked'));
    await expect(getOrCreateEncryptionKey()).resolves.toBeNull();
  });
});
