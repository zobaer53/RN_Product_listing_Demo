import {
  configureFonts,
  MD3LightTheme,
  type MD3Theme,
  type MD3TypescaleKey,
} from 'react-native-paper';

import { FontFamily } from './fonts';
import { colors, radius, sizes, spacing } from './tokens';
import { typography } from './typography';

type MD3Type = MD3Theme['fonts'][MD3TypescaleKey];

const LABEL_KEYS: readonly string[] = ['labelLarge', 'labelMedium', 'labelSmall'];

const familyFor = (key: string, weight: MD3Type['fontWeight']): string => {
  if (LABEL_KEYS.includes(key)) return FontFamily.labelBold;
  return weight === '500' ? FontFamily.medium : FontFamily.regular;
};

// Every weight is a separate family, so the weight is carried by the family itself.
const fontOverrides = Object.fromEntries(
  Object.entries(MD3LightTheme.fonts)
    .filter(([key]) => key !== 'default')
    .map(([key, type]) => [
      key,
      { fontFamily: familyFor(key, type.fontWeight), fontWeight: '400' },
    ]),
) as Partial<Record<MD3TypescaleKey, Partial<MD3Type>>>;

const fonts = configureFonts({ config: fontOverrides });

/** Design-system values that have no MD3 role, exposed via `useAppTheme().custom`. */
export const customTokens = { colors, radius, spacing, sizes, typography } as const;

export type AppTheme = MD3Theme & { custom: typeof customTokens };

/** Paper MD3 light theme extended with the design system. Pass to `PaperProvider`. */
export const paperTheme: AppTheme = {
  ...MD3LightTheme,
  dark: false,
  roundness: radius.md,
  fonts: { ...fonts, default: { ...fonts.default, fontFamily: FontFamily.regular } },
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryContainer,
    onPrimaryContainer: colors.onPrimaryContainer,
    secondary: colors.brandTeal,
    tertiary: colors.brandOrange,
    error: colors.discount,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceMuted,
    outline: colors.border,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondaryAA,
    onBackground: colors.textPrimary,
  },
  custom: customTokens,
};
