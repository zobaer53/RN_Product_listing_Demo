import { StyleSheet, Text, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { MAX_FONT_SCALE, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { RatingStars } from '@shared/ui/skia/RatingStars';
import { formatRating } from '@shared/utils/format';

export interface ProductRatingRowProps {
  rating: number;
  /** Omitted while only the summary is known. */
  reviewCount?: number;
}

/** Stars plus "2.6 · 3 reviews". */
export function ProductRatingRow({ rating, reviewCount }: ProductRatingRowProps) {
  const reviews =
    reviewCount === undefined ? '' : ` · ${reviewCount} review${reviewCount === 1 ? '' : 's'}`;

  return (
    <View style={styles.row} testID={TestIds.detailsRating}>
      <RatingStars rating={rating} size={16} />
      <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {`${formatRating(rating)}${reviews}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: typography.caption,
});
