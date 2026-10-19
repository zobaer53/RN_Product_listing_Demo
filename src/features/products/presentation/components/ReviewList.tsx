import { StyleSheet, Text, View } from 'react-native';

import { useNow } from '@shared/hooks/use-now';
import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, sizes, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { SectionHeader } from '@shared/ui/SectionHeader';
import { RatingStars } from '@shared/ui/skia/RatingStars';
import { formatRelativeTime } from '@shared/utils/format';

import type { Review } from '../../domain/entities/product';

export interface ReviewListProps {
  reviews: readonly Review[];
  /** Current time, injectable for tests. */
  now?: number;
}

function ReviewItem({ review, now }: { review: Review; now: number }) {
  const posted = Date.parse(review.date);
  return (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {review.reviewerName}
        </Text>
        {Number.isNaN(posted) ? null : (
          <Text style={styles.date} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {formatRelativeTime(posted, now)}
          </Text>
        )}
      </View>
      <RatingStars rating={review.rating} size={12} />
      <Text style={styles.comment} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {review.comment}
      </Text>
    </View>
  );
}

/**
 * Customer reviews. Only the name, rating, date and comment are shown; reviewer e-mail
 * addresses are personal data and are never rendered.
 */
export function ReviewList({ reviews, now }: ReviewListProps) {
  const currentTime = useNow();
  const reference = now ?? currentTime;

  return (
    <View style={styles.section} testID={TestIds.detailsReviews}>
      <SectionHeader
        title="Reviews"
        caption={`${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
      />
      {reviews.length === 0 ? (
        <Text style={styles.empty} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          No reviews yet
        </Text>
      ) : (
        reviews.map((review, index) => (
          <ReviewItem key={`${review.reviewerName}-${index}`} review={review} now={reference} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  item: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.bodyMedium, flexShrink: 1 },
  date: typography.caption,
  comment: typography.body,
  empty: typography.caption,
});
