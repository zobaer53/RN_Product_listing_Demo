import { StyleSheet, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { spacing } from '@shared/theme/tokens';
import { Shimmer } from '@shared/ui/skia/Shimmer';

export interface ProductDetailsSkeletonProps {
  /** `full` replaces the whole screen; `body` sits below an already known summary. */
  variant?: 'full' | 'body';
}

function BodySkeleton() {
  return (
    <View style={styles.body}>
      <Shimmer height={14} width="100%" radius={4} />
      <Shimmer height={14} width="92%" radius={4} />
      <Shimmer height={14} width="70%" radius={4} />
      <Shimmer height={180} />
      <Shimmer height={96} />
    </View>
  );
}

/** Shimmering placeholder of the details screen. */
export function ProductDetailsSkeleton({ variant = 'full' }: ProductDetailsSkeletonProps) {
  if (variant === 'body') {
    return (
      <View
        testID={TestIds.detailsSkeleton}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading product details"
      >
        <BodySkeleton />
      </View>
    );
  }

  return (
    <View
      testID={TestIds.stateLoading}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading product"
    >
      <Shimmer height={320} radius={0} />
      <View style={styles.summary}>
        <Shimmer height={12} width="30%" radius={4} />
        <Shimmer height={24} width="85%" radius={4} />
        <Shimmer height={28} width="45%" radius={4} />
        <Shimmer height={16} width="55%" radius={4} />
      </View>
      <BodySkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.md, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  body: { gap: spacing.md, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
});
