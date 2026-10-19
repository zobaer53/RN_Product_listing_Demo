import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';

import { startConnectivityListener } from './connectivity.listener';
import { useConnectivityStore, useIsOnline } from './connectivity.store';

jest.mock('@react-native-community/netinfo', () =>
  jest.requireActual('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

type Listener = (state: NetInfoState) => void;

const addEventListener = jest.mocked(NetInfo.addEventListener);
const unsubscribeNetInfo = jest.fn();
let emit: Listener = () => undefined;

const netState = (isConnected: boolean | null, isInternetReachable: boolean | null): NetInfoState =>
  ({ isConnected, isInternetReachable }) as NetInfoState;

describe('connectivity listener', () => {
  beforeEach(() => {
    addEventListener.mockImplementation((listener) => {
      emit = listener;
      return unsubscribeNetInfo;
    });
  });

  afterEach(() => {
    unsubscribeNetInfo.mockClear();
    onlineManager.setOnline(true);
    useConnectivityStore.getState().setOnline(true);
  });

  it('[CORE-NET-01] marks the app and TanStack offline when NetInfo reports offline', async () => {
    const stop = startConnectivityListener();
    const { result } = await renderHook(() => useIsOnline());
    expect(result.current).toBe(true);

    await act(() => emit(netState(false, false)));

    expect(result.current).toBe(false);
    expect(useConnectivityStore.getState().isOnline).toBe(false);
    expect(useConnectivityStore.getState().lastChangedAt).toBeGreaterThan(0);
    expect(onlineManager.isOnline()).toBe(false);

    await act(() => emit(netState(true, true)));
    expect(result.current).toBe(true);
    expect(onlineManager.isOnline()).toBe(true);
    stop();
  });

  it('[CORE-NET-02] treats unknown reachability (null) as online', () => {
    const stop = startConnectivityListener();

    emit(netState(true, null));
    expect(useConnectivityStore.getState().isOnline).toBe(true);
    expect(onlineManager.isOnline()).toBe(true);

    emit(netState(true, false));
    expect(useConnectivityStore.getState().isOnline).toBe(false);
    stop();
  });

  it('[CORE-NET-03] unsubscribes from NetInfo on teardown', () => {
    const stop = startConnectivityListener();
    expect(addEventListener).toHaveBeenCalled();

    stop();

    expect(unsubscribeNetInfo).toHaveBeenCalled();
  });
});
