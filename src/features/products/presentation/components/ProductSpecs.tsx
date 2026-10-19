import { StyleSheet, Text, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, sizes, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { SectionHeader } from '@shared/ui/SectionHeader';

import type { Product } from '../../domain/entities/product';

const specRows = (product: Product): [label: string, value: string][] => {
  const { width, height, depth } = product.dimensions;
  return [
    ['SKU', product.sku],
    ['Weight', `${product.weight} kg`],
    ['Dimensions', `${width} × ${height} × ${depth} cm`],
    ['Warranty', product.warrantyInformation],
    ['Shipping', product.shippingInformation],
    ['Return policy', product.returnPolicy],
    ['Minimum order', `${product.minimumOrderQuantity} units`],
  ];
};

export interface ProductSpecsProps {
  product: Product;
}

/** Bordered card of label/value specification rows. */
export function ProductSpecs({ product }: ProductSpecsProps) {
  const rows = specRows(product);
  return (
    <View style={styles.section} testID={TestIds.detailsSpecs}>
      <SectionHeader title="Specifications" />
      <View style={styles.card}>
        {rows.map(([label, value], index) => (
          <View
            key={label}
            style={[styles.row, index < rows.length - 1 && styles.divider]}
            accessible
            accessibilityLabel={`${label}: ${value}`}
          >
            <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {label}
            </Text>
            <Text style={styles.value} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  card: {
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: { borderBottomWidth: sizes.borderWidth, borderBottomColor: colors.border },
  label: { ...typography.caption, fontSize: 14, lineHeight: 20 },
  value: { ...typography.bodyMedium, flexShrink: 1, textAlign: 'right' },
});
