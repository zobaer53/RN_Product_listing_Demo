import { renderHook } from '@testing-library/react-native';

import { startConnectivityListener } from '../connectivity/connectivity.listener';
import { subscribeAppStateFocus } from '../query/app-state-focus';
import { useAppLifecycle } from './use-app-lifecycle';

jest.mock('../connectivity/connectivity.listener', () => ({
  startConnectivityListener: jest.fn(),
}));
jest.mock('../query/app-state-focus', () => ({ subscribeAppStateFocus: jest.fn() }));

describe('useAppLifecycle', () => {
  it('[BOOT-02] starts connectivity and focus tracking and stops them on unmount', async () => {
    const stopConnectivity = jest.fn();
    const stopFocus = jest.fn();
    jest.mocked(startConnectivityListener).mockReturnValue(stopConnectivity);
    jest.mocked(subscribeAppStateFocus).mockReturnValue(stopFocus);

    const { unmount } = await renderHook(() => useAppLifecycle());
    expect(startConnectivityListener).toHaveBeenCalledTimes(1);
    expect(subscribeAppStateFocus).toHaveBeenCalledTimes(1);

    await unmount();
    expect(stopConnectivity).toHaveBeenCalledTimes(1);
    expect(stopFocus).toHaveBeenCalledTimes(1);
  });
});
