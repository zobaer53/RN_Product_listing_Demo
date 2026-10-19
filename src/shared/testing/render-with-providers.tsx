import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { paperTheme } from '../theme/paper-theme';

const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** The providers the app root mounts around every screen. */
export function TestProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </SafeAreaProvider>
  );
}

/** `render` from Testing Library wrapped in the app's providers. */
export const renderWithProviders = (ui: ReactElement) => render(ui, { wrapper: TestProviders });
