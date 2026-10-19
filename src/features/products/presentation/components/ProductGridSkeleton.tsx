import { StyleSheet, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, radius, sizes, spacing } from '@shared/theme/tokens';
import { Shimmer } from '@shared/ui/skia/Shimmer';

const PLACEHOLDER_COUNT = 6;

function CardSkeleton() {
  return (
    <View style={styles.card} testID="product-card-skeleton">
      <Shimmer height={sizes.cardImageHeight} />
      <View style={styles.body}>
        <Shimmer height={14} width="90%" radius={4} />
        <Shimmer height={14} width="60%" radius={4} />
        <Shimmer height={14} width="40%" radius={4} />
      </View>
    </View>
  );
}

/** Six shimmering card placeholders shown during the first load. */
export function ProductGridSkeleton() {
  return (
    <View
      style={styles.grid}
      testID={TestIds.stateLoading}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading products"
    >
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <View key={index} style={styles.cell}>
          <CardSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.gutter,
    columnGap: spacing.columnGap,
    rowGap: spacing.xl,
  },
  // Two cells per row: each starts below half width and grows to fill around the gap.
  cell: { flexBasis: '40%', flexGrow: 1 },
  card: {
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  body: { padding: spacing.md, gap: spacing.sm, alignItems: 'center' },
});
