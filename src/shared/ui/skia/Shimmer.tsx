import { Canvas, Fill, LinearGradient } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius as radii } from '../../theme/tokens';

const SWEEP_MS = 1200;
const HIGHLIGHT = 'rgba(255, 255, 255, 0.65)';
const BASE = 'rgba(255, 255, 255, 0)';

export interface ShimmerProps {
  height: DimensionValue;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Skeleton block with a light sweep drawn by Skia. The sweep is driven on the UI thread
 * and is skipped entirely when the user has Reduce Motion enabled.
 */
export function Shimmer({
  height,
  width = '100%',
  radius = radii.md,
  style,
  testID,
}: ShimmerProps) {
  const reduceMotion = useReducedMotion();
  // Width from onLayout: Canvas `onSize` measures every frame and warns while unmounting.
  const blockWidth = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    progress.set(withRepeat(withTiming(1, { duration: SWEEP_MS, easing: Easing.linear }), -1));
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const start = useDerivedValue(() => {
    const sweepWidth = blockWidth.get();
    return { x: -sweepWidth + progress.get() * 2 * sweepWidth, y: 0 };
  });
  const end = useDerivedValue(() => ({ x: start.get().x + blockWidth.get(), y: 0 }));
  const onLayout = (event: LayoutChangeEvent) => blockWidth.set(event.nativeEvent.layout.width);

  return (
    <View
      testID={testID}
      style={[styles.block, { width, height, borderRadius: radius }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={onLayout}
    >
      {reduceMotion ? null : (
        <Canvas style={StyleSheet.absoluteFill}>
          <Fill>
            <LinearGradient start={start} end={end} colors={[BASE, HIGHLIGHT, BASE]} />
          </Fill>
        </Canvas>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
});
