import { Canvas, Path } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { formatDiscount } from '../../utils/format';

/** Side of the square corner the ribbon is drawn in. */
const SIZE = 96;
/** Distances from the corner (along each edge) where the band starts and ends. */
const BAND_NEAR = 28;
const BAND_FAR = 54;
const LABEL_WIDTH = 80;
const LABEL_HEIGHT = 16;

const BAND_PATH = `M${SIZE - BAND_FAR} 0 L${SIZE - BAND_NEAR} 0 L${SIZE} ${BAND_NEAR} L${SIZE} ${BAND_FAR} Z`;
const BAND_CENTER = (BAND_NEAR + BAND_FAR) / 2 / 2;

export interface DiscountRibbonProps {
  discountPercentage: number;
}

/**
 * 45° corner ribbon for the top-right of a product image. Renders nothing for
 * discounts under 1%. The parent must clip its children (`overflow: 'hidden'`).
 */
export function DiscountRibbon({ discountPercentage }: DiscountRibbonProps) {
  if (!(discountPercentage >= 1)) return null;

  return (
    <View style={styles.corner}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={BAND_PATH} color={colors.discount} />
      </Canvas>
      <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1}>
        {formatDiscount(discountPercentage)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    width: SIZE,
    height: SIZE,
  },
  label: {
    ...typography.ribbon,
    position: 'absolute',
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    left: SIZE - BAND_CENTER - LABEL_WIDTH / 2,
    top: BAND_CENTER - LABEL_HEIGHT / 2,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ rotate: '45deg' }],
  },
});
