import type { TextStyle } from 'react-native';

import { FontFamily } from './fonts';
import { colors } from './tokens';

/** Text styles of the design system. Colors default to the AA-compliant variants. */
export const typography = {
  wordmark: { fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 20, letterSpacing: -0.24 },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  title: { fontFamily: FontFamily.bold, fontSize: 20, lineHeight: 28, color: colors.textStrong },
  body: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 22, color: colors.textPrimary },
  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardPrice: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.priceAA,
  },
  priceLarge: { fontFamily: FontFamily.bold, fontSize: 24, lineHeight: 30, color: colors.price },
  caption: {
    fontFamily: FontFamily.label,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondaryAA,
  },
  captionSmall: {
    fontFamily: FontFamily.label,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textSecondaryAA,
  },
  label: { fontFamily: FontFamily.labelBold, fontSize: 12, lineHeight: 16 },
  ribbon: { fontFamily: FontFamily.ribbon, fontSize: 12, lineHeight: 16, color: colors.white },
} as const satisfies Record<string, TextStyle>;
