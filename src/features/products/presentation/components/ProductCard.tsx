import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, sizes, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { DiscountRibbon } from '@shared/ui/skia/DiscountRibbon';
import { StarIcon } from '@shared/ui/skia/RatingStars';
import { formatPrice, formatRating } from '@shared/utils/format';

import type { ProductSummary } from '../../domain/entities/product';

export interface ProductCardProps {
  product: ProductSummary;
  onPress: (id: number) => void;
  /** Fired on touch down, e.g. to prefetch details. */
  onPressIn?: (id: number) => void;
}

/** Grid card: image with discount ribbon, two-line title, price and rating. */
export function ProductCard({ product, onPress, onPressIn }: ProductCardProps) {
  const { id, title, price, rating, thumbnailUrl, discountPercentage } = product;
  const priceLabel = formatPrice(price);
  const ratingLabel = formatRating(rating);

  return (
    <Pressable
      testID={TestIds.productCard(id)}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${priceLabel}, rated ${ratingLabel} out of 5`}
      onPress={() => onPress(id)}
      onPressIn={onPressIn ? () => onPressIn(id) : undefined}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageArea}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.image}
          contentFit="contain"
          recyclingKey={String(id)}
          transition={150}
          accessible={false}
        />
        <DiscountRibbon discountPercentage={discountPercentage} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.price} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {priceLabel}
          </Text>
          <View style={styles.rating}>
            <StarIcon size={12} />
            <Text style={styles.ratingText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {ratingLabel}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  imageArea: {
    height: sizes.cardImageHeight,
    backgroundColor: colors.imagePlaceholder,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: { flex: 1, margin: spacing.md },
  body: { padding: spacing.md, gap: spacing.xs, flexGrow: 1, justifyContent: 'space-between' },
  title: { ...typography.cardTitle, minHeight: typography.cardTitle.lineHeight * 2 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: typography.cardPrice,
  rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingText: typography.caption,
});
