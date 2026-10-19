import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Lato_400Regular } from '@expo-google-fonts/lato/400Regular';
import { Lato_700Bold } from '@expo-google-fonts/lato/700Bold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';

/**
 * Font family names as registered with `useFonts(appFonts)`. Each weight is its own
 * family, so styles set `fontFamily` only and never rely on `fontWeight`.
 */
export const FontFamily = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  label: 'Lato_400Regular',
  labelBold: 'Lato_700Bold',
  ribbon: 'Poppins_700Bold',
} as const;

/** Font map to pass to `useFonts` from expo-font at the app root. */
export const appFonts = {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  Lato_400Regular,
  Lato_700Bold,
  Poppins_700Bold,
} as const;
