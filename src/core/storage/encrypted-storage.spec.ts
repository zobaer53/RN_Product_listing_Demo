import { createMMKV, deleteMMKV, existsMMKV } from 'react-native-mmkv';

import { getOrCreateEncryptionKey } from '../security/encryption-key';
import {
  CACHE_STORAGE_ID,
  createEncryptedStorage,
  createMemoryStorage,
  openSecureCacheStorage,
} from './encrypted-storage';

jest.mock('react-native-mmkv', () => {
  const createFakeMMKV = () => {
    const values = new Map<string, string>();
    return {
      getString: jest.fn((key: string) => values.get(key)),
      set: jest.fn((key: string, value: string) => values.set(key, value)),
      remove: jest.fn((key: string) => values.delete(key)),
      clearAll: jest.fn(() => values.clear()),
    };
  };
  return {
    createMMKV: jest.fn(createFakeMMKV),
    existsMMKV: jest.fn(() => false),
    deleteMMKV: jest.fn(() => true),
  };
});
jest.mock('../security/encryption-key', () => ({ getOrCreateEncryptionKey: jest.fn() }));

const mockedCreateMMKV = jest.mocked(createMMKV);
const mockedExistsMMKV = jest.mocked(existsMMKV);
const mockedDeleteMMKV = jest.mocked(deleteMMKV);
const mockedGetKey = jest.mocked(getOrCreateEncryptionKey);
const KEY = 'k'.repeat(32);

describe('encrypted storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('[CORE-STO-01] creates MMKV with the encryption key and AES-256', () => {
    const storage = createEncryptedStorage({ id: 'test-store', key: KEY, isNewKey: false });

    expect(mockedCreateMMKV).toHaveBeenCalledWith({
      id: 'test-store',
      encryptionKey: KEY,
      encryptionType: 'AES-256',
    });
    storage.setItem('a', '1');
    expect(storage.getItem('a')).toBe('1');
    storage.removeItem('a');
    expect(storage.getItem('a')).toBeNull();
    expect(mockedDeleteMMKV).not.toHaveBeenCalled();
  });

  it('[CORE-STO-02] wipes an existing store before first use when the key is new', () => {
    mockedExistsMMKV.mockReturnValueOnce(true);

    const storage = createEncryptedStorage({ id: 'test-store', key: KEY, isNewKey: true });
    storage.setItem('a', '1');

    expect(mockedExistsMMKV).toHaveBeenCalledWith('test-store');
    expect(mockedDeleteMMKV).toHaveBeenCalledWith('test-store');
    const [deleteOrder] = mockedDeleteMMKV.mock.invocationCallOrder;
    const [createOrder] = mockedCreateMMKV.mock.invocationCallOrder;
    expect(deleteOrder).toBeLessThan(createOrder ?? 0);
  });

  it('[CORE-SEC-03] falls back to memory storage when no key is available', async () => {
    mockedGetKey.mockResolvedValue(null);

    const { storage, encrypted } = await openSecureCacheStorage();
    storage.setItem('a', '1');

    expect(encrypted).toBe(false);
    expect(storage.getItem('a')).toBe('1');
    expect(mockedCreateMMKV).not.toHaveBeenCalled();
  });

  it('[CORE-STO-03] opens the encrypted cache store when a key is available', async () => {
    mockedGetKey.mockResolvedValue({ key: KEY, isNew: false });

    const { encrypted } = await openSecureCacheStorage();

    expect(encrypted).toBe(true);
    expect(mockedCreateMMKV).toHaveBeenCalledWith(
      expect.objectContaining({ id: CACHE_STORAGE_ID, encryptionKey: KEY }),
    );
  });

  it('[CORE-STO-04] memory storage implements the key-value contract', () => {
    const storage = createMemoryStorage();

    expect(storage.getItem('missing')).toBeNull();
    storage.setItem('a', '1');
    expect(storage.getItem('a')).toBe('1');
    storage.removeItem('a');
    expect(storage.getItem('a')).toBeNull();
  });
});
