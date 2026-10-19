import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

import { useConnectivityStore } from './connectivity.store';

/** Only an explicit `false` means offline; `null` (not determined yet) counts as online. */
export const isOnlineState = ({
  isConnected,
  isInternetReachable,
}: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>): boolean =>
  isConnected !== false && isInternetReachable !== false;

/**
 * Feeds NetInfo into the connectivity store and TanStack's onlineManager, so queries pause
 * while offline and resume on reconnect. Returns the teardown.
 */
export const startConnectivityListener = (): (() => void) => {
  let unsubscribe: (() => void) | undefined;
  onlineManager.setEventListener((setOnline) => {
    unsubscribe = NetInfo.addEventListener((state) => {
      const online = isOnlineState(state);
      useConnectivityStore.getState().setOnline(online);
      setOnline(online);
    });
    return unsubscribe;
  });
  return () => unsubscribe?.();
};
