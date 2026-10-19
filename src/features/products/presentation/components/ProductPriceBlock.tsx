import { StyleSheet, Text, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { formatPrice } from '@shared/utils/format';

import { originalPrice } from '../../domain/helpers/pricing';

export interface ProductPriceBlockProps {
  price: number;
  discountPercentage: number;
}

/** Large price with the pre-discount price struck through and a discount badge. */
export function ProductPriceBlock({ price, discountPercentage }: ProductPriceBlockProps) {
  const current = formatPrice(price);
  const before = originalPrice(price, discountPercentage);
  const percent = Math.floor(discountPercentage);
  const hasDiscount = percent >= 1 && before > price;
  const label = hasDiscount
    ? `Price ${current}, was ${formatPrice(before)}, ${percent}% off`
    : `Price ${current}`;

  return (
    <View style={styles.row} testID={TestIds.detailsPrice} accessible accessibilityLabel={label}>
      <Text style={styles.price} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {current}
      </Text>
      {hasDiscount ? (
        <>
          <Text style={styles.original} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {formatPrice(before)}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {`−${percent}%`}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  price: typography.priceLarge,
  original: {
    ...typography.body,
    color: colors.textSecondaryAA,
    textDecorationLine: 'line-through',
  },
  badge: {
    backgroundColor: colors.dangerContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: { ...typography.label, color: colors.danger },
});
