import { createDeferredStorage } from './deferred-storage';
import type { KeyValueStorage } from './key-value-storage';
import { createMemoryStorage } from './memory-storage';

const deferred = () => {
  let resolve!: (storage: KeyValueStorage) => void;
  const ready = new Promise<KeyValueStorage>((r) => {
    resolve = r;
  });
  return { ready, resolve };
};

describe('createDeferredStorage', () => {
  it('[STO-05] waits for the underlying storage before reading', async () => {
    const { ready, resolve } = deferred();
    const storage = createDeferredStorage(ready);
    let value: string | null | undefined;
    const read = storage.getItem('k').then((v) => {
      value = v;
    });

    await Promise.resolve();
    expect(value).toBeUndefined();

    const underlying = createMemoryStorage();
    underlying.setItem('k', 'v');
    resolve(underlying);
    await read;
    expect(value).toBe('v');
  });

  it('[STO-05] applies writes and removals to the underlying storage once ready', async () => {
    const underlying = createMemoryStorage();
    const storage = createDeferredStorage(Promise.resolve(underlying));

    await storage.setItem('k', 'v');
    expect(underlying.getItem('k')).toBe('v');

    await storage.removeItem('k');
    expect(underlying.getItem('k')).toBeNull();
  });
});
