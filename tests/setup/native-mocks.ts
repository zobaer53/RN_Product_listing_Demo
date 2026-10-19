// Global mocks for native-only libraries used by presentation code.
import '@shopify/flash-list/jestSetup';
import { setUpTests } from 'react-native-reanimated';

setUpTests();

jest.mock(
  '@shopify/react-native-skia',
  () => jest.requireActual<typeof import('./skia-mock')>('./skia-mock').skiaMock,
);

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);
