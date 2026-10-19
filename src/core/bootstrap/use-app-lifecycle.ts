import { useEffect } from 'react';

import { startConnectivityListener } from '../connectivity/connectivity.listener';
import { subscribeAppStateFocus } from '../query/app-state-focus';

/** Wires connectivity and app focus into the query layer for the lifetime of the app. */
export const useAppLifecycle = (): void => {
  useEffect(() => {
    const stopConnectivity = startConnectivityListener();
    const stopFocus = subscribeAppStateFocus();
    return () => {
      stopConnectivity();
      stopFocus();
    };
  }, []);
};
