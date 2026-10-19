import { useEffect, useState } from 'react';

/** Current epoch ms, refreshed every `intervalMs` so relative times stay accurate. */
export const useNow = (intervalMs = 60_000): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
};
