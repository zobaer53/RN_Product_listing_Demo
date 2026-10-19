import { act, renderHook } from '@testing-library/react-native';

import { useNow } from './use-now';

describe('useNow', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: Date.UTC(2026, 9, 19, 12, 0, 0) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('[SH-09] ticks on the given interval', async () => {
    const start = Date.now();
    const { result } = await renderHook(() => useNow(1_000));
    expect(result.current).toBe(start);

    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(start + 1_000);
  });
});
