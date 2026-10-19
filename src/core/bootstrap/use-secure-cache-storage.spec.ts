import { renderHook, waitFor } from '@testing-library/react-native';

import { openSecureCacheStorage } from '../storage/encrypted-storage';
import { createMemoryStorage } from '../storage/memory-storage';
import { useSecureCacheStorage } from './use-secure-cache-storage';

jest.mock('../storage/encrypted-storage', () => ({ openSecureCacheStorage: jest.fn() }));

describe('useSecureCacheStorage', () => {
  it('[BOOT-01] is null until the secure cache storage is opened, then returns it', async () => {
    const storage = createMemoryStorage();
    jest.mocked(openSecureCacheStorage).mockResolvedValue({ storage, encrypted: true });

    const { result } = await renderHook(() => useSecureCacheStorage());

    await waitFor(() => expect(result.current).toBe(storage));
    expect(openSecureCacheStorage).toHaveBeenCalledTimes(1);
  });
});
