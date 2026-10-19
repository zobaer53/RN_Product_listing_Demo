/**
 * Design system tokens. Colors suffixed `AA` meet WCAG AA contrast for small text on
 * white; their non-AA siblings are reserved for large or decorative use.
 */
export const colors = {
  primary: '#14AB87',
  primaryContainer: '#C8EDD9',
  onPrimaryContainer: '#027335',
  brandTeal: '#4AB7B6',
  brandOrange: '#FDAA5D',
  textPrimary: '#303733',
  textStrong: '#293041',
  textSecondary: '#7D8FAB',
  textSecondaryAA: '#5E6E89',
  price: '#C29C1D',
  priceAA: '#8F7212',
  star: '#FFA902',
  discount: '#FF4040',
  border: '#E8EFF3',
  outlineMuted: '#BFC9DA',
  surfaceMuted: '#EFF1F3',
  imagePlaceholder: '#F2F2F2',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  warning: '#B45309',
  warningContainer: '#FEF3C7',
  danger: '#B42318',
  dangerContainer: '#FEE4E2',
  scrim: 'rgba(41, 48, 65, 0.32)',
} as const;

export const radius = {
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  /** Horizontal screen gutter. */
  gutter: 28,
  /** Gap between the two grid columns. */
  columnGap: 20,
} as const;

export const sizes = {
  cardImageHeight: 140,
  buttonHeight: 36,
  /** Minimum touch target (iOS HIG 44pt). */
  minTouchTarget: 44,
  backButton: 32,
  borderWidth: 1,
} as const;

/** Upper bound for Dynamic Type scaling on dense text so layouts stay intact. */
export const MAX_FONT_SCALE = 1.3;

export type AppColors = typeof colors;
