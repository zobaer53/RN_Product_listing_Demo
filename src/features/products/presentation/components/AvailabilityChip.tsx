import { StyleSheet, Text, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';

import type { Availability } from '../../domain/entities/product';

const tones: Record<Availability, { background: string; foreground: string }> = {
  in_stock: { background: colors.primaryContainer, foreground: colors.onPrimaryContainer },
  low_stock: { background: colors.warningContainer, foreground: colors.warning },
  out_of_stock: { background: colors.dangerContainer, foreground: colors.danger },
};

const labelOf = (availability: Availability, stock: number): string => {
  switch (availability) {
    case 'in_stock':
      return 'In stock';
    case 'low_stock':
      return `Low stock · ${stock} left`;
    case 'out_of_stock':
      return 'Out of stock';
  }
};

export interface AvailabilityChipProps {
  availability: Availability;
  stock: number;
}

/** Stock status pill: green in stock, amber low stock, red out of stock. */
export function AvailabilityChip({ availability, stock }: AvailabilityChipProps) {
  const tone = tones[availability];
  return (
    <View
      style={[styles.chip, { backgroundColor: tone.background }]}
      testID={TestIds.detailsAvailability}
    >
      <View style={[styles.dot, { backgroundColor: tone.foreground }]} />
      <Text
        style={[styles.text, { color: tone.foreground }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {labelOf(availability, stock)}
      </Text>
    </View>
  );
}

const DOT = 6;

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  text: typography.label,
});
