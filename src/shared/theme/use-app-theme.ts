import { useTheme } from 'react-native-paper';

import type { AppTheme } from './paper-theme';

/** Typed access to the Paper theme plus the design system's custom tokens. */
export const useAppTheme = () => useTheme<AppTheme>();
