import { useEffect, useState } from 'react';

import type { KeyValueStorage } from '../storage/key-value-storage';
import { openSecureCacheStorage } from '../storage/encrypted-storage';

/** Opens the encrypted cache store once. `null` until it is ready (keep the splash up). */
export const useSecureCacheStorage = (): KeyValueStorage | null => {
  const [storage, setStorage] = useState<KeyValueStorage | null>(null);

  useEffect(() => {
    let active = true;
    void openSecureCacheStorage().then((result) => {
      if (active) setStorage(result.storage);
    });
    return () => {
      active = false;
    };
  }, []);

  return storage;
};
