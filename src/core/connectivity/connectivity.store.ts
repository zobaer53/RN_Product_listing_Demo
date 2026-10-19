import { create } from 'zustand';

export interface ConnectivityState {
  isOnline: boolean;
  /** Epoch ms of the last online/offline transition, 0 if it never changed. */
  lastChangedAt: number;
  setOnline: (isOnline: boolean) => void;
}

/** App-wide connectivity flag, fed by the NetInfo listener. Optimistically online at start. */
export const useConnectivityStore = create<ConnectivityState>()((set) => ({
  isOnline: true,
  lastChangedAt: 0,
  setOnline: (isOnline) =>
    set((state) => (state.isOnline === isOnline ? state : { isOnline, lastChangedAt: Date.now() })),
}));

export const useIsOnline = (): boolean => useConnectivityStore((state) => state.isOnline);
