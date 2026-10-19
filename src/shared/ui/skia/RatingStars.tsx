import { Canvas, Group, Path, rect } from '@shopify/react-native-skia';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '../../theme/tokens';
import { formatRating } from '../../utils/format';
import { starPath } from './star-path';

const MAX_RATING = 5;

/** Fill fraction (0..1) of each of the five stars for a rating. */
export const starFills = (rating: number): number[] => {
  const safe = Number.isFinite(rating) ? Math.min(Math.max(rating, 0), MAX_RATING) : 0;
  return Array.from({ length: MAX_RATING }, (_, index) => Math.min(Math.max(safe - index, 0), 1));
};

export interface RatingStarsProps {
  rating: number;
  /** Size of one star in points. */
  size?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Five stars with fractional fill (2.56 → two full stars and 56% of the third). */
export function RatingStars({ rating, size = 16, gap = 2, style, testID }: RatingStarsProps) {
  const fills = starFills(rating);
  const width = MAX_RATING * size + (MAX_RATING - 1) * gap;

  return (
    <Canvas
      style={[{ width, height: size }, style]}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Rated ${formatRating(rating)} out of ${MAX_RATING}`}
    >
      {fills.map((fill, index) => {
        const x = index * (size + gap);
        const path = starPath(size, x);
        return (
          <Group key={index}>
            <Path path={path} color={colors.outlineMuted} />
            {fill > 0 ? (
              <Group clip={rect(x, 0, size * fill, size)}>
                <Path path={path} color={colors.star} />
              </Group>
            ) : null}
          </Group>
        );
      })}
    </Canvas>
  );
}

export interface StarIconProps {
  size?: number;
  color?: string;
  testID?: string;
}

/** Single decorative filled star, used next to compact ratings. */
export function StarIcon({ size = 14, color = colors.star, testID }: StarIconProps) {
  return (
    <Canvas
      style={{ width: size, height: size }}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path path={starPath(size)} color={color} />
    </Canvas>
  );
}
