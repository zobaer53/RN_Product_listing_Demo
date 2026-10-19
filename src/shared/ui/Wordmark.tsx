import { StyleSheet, Text } from 'react-native';

import { colors, MAX_FONT_SCALE } from '../theme/tokens';
import { typography } from '../theme/typography';

/** Two-tone "ProductExplorer" logotype. */
export function Wordmark() {
  return (
    <Text
      style={styles.wordmark}
      accessibilityRole="header"
      accessibilityLabel="Product Explorer"
      maxFontSizeMultiplier={MAX_FONT_SCALE}
    >
      <Text style={styles.product}>Product</Text>
      <Text style={styles.explorer}>Explorer</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: typography.wordmark,
  product: { color: colors.brandOrange },
  explorer: { color: colors.brandTeal },
});
