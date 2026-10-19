import { focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

/** Lets TanStack Query refetch stale data when the app returns to the foreground. */
export const subscribeAppStateFocus = (): (() => void) => {
  let remove: (() => void) | undefined;
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (status) =>
      setFocused(status === 'active'),
    );
    remove = () => subscription.remove();
    return remove;
  });
  return () => remove?.();
};
