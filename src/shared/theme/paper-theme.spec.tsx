import { render, renderHook, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { FontFamily, appFonts } from './fonts';
import { paperTheme } from './paper-theme';
import { colors, radius } from './tokens';
import { useAppTheme } from './use-app-theme';

const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <PaperProvider theme={paperTheme}>{children}</PaperProvider>
);

describe('theme', () => {
  it('[THM-01] maps the design system palette onto MD3 roles', () => {
    expect(paperTheme.colors).toMatchObject({
      primary: '#14AB87',
      primaryContainer: '#C8EDD9',
      onPrimaryContainer: '#027335',
      secondary: '#4AB7B6',
      tertiary: '#FDAA5D',
      error: '#FF4040',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceVariant: '#EFF1F3',
      outline: '#E8EFF3',
      onSurface: '#303733',
      onSurfaceVariant: '#5E6E89',
    });
    expect(paperTheme.roundness).toBe(radius.md);
    expect(paperTheme.dark).toBe(false);
  });

  it('[THM-02] uses DM Sans for body text and Lato for labels', () => {
    expect(paperTheme.fonts.bodyMedium.fontFamily).toBe(FontFamily.regular);
    expect(paperTheme.fonts.titleMedium.fontFamily).toBe(FontFamily.medium);
    expect(paperTheme.fonts.labelLarge.fontFamily).toBe(FontFamily.labelBold);
    expect(paperTheme.fonts.default.fontFamily).toBe(FontFamily.regular);
  });

  it('[THM-03] registers every font family used by the design system', () => {
    expect(Object.keys(appFonts).sort()).toEqual(
      [
        'DMSans_400Regular',
        'DMSans_500Medium',
        'DMSans_700Bold',
        'Lato_400Regular',
        'Lato_700Bold',
        'Poppins_700Bold',
      ].sort(),
    );
    for (const family of Object.values(FontFamily)) {
      expect(appFonts).toHaveProperty(family);
    }
  });

  it('[THM-04] exposes custom tokens through useAppTheme', async () => {
    const { result } = await renderHook(() => useAppTheme(), { wrapper: ThemeProvider });
    expect(result.current.custom.colors.price).toBe(colors.price);
    expect(result.current.custom.colors.priceAA).toBe('#8F7212');
    expect(result.current.colors.primary).toBe('#14AB87');
  });

  it('[THM-04] works inside the provider tree', async () => {
    const Probe = () => {
      const theme = useAppTheme();
      return <Text>{theme.custom.colors.brandTeal}</Text>;
    };
    await render(<Probe />, { wrapper: ThemeProvider });
    expect(screen.getByText('#4AB7B6')).toBeOnTheScreen();
  });
});
