import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, sizes, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { ErrorState } from '@shared/ui/ErrorState';
import { NotFoundState } from '@shared/ui/NotFoundState';
import { OfflineState } from '@shared/ui/OfflineState';
import { SectionHeader } from '@shared/ui/SectionHeader';

import type { Product, ProductSummary } from '../../domain/entities/product';
import { AvailabilityChip } from '../components/AvailabilityChip';
import { ProductDetailsSkeleton } from '../components/ProductDetailsSkeleton';
import { ProductImageCarousel } from '../components/ProductImageCarousel';
import { ProductPriceBlock } from '../components/ProductPriceBlock';
import { ProductRatingRow } from '../components/ProductRatingRow';
import { ProductSpecs } from '../components/ProductSpecs';
import { ReviewList } from '../components/ReviewList';
import { isFullProduct, type ProductDetailsViewProps } from './view-contracts';

function BackButton({ onPress, top }: { onPress: () => void; top: number }) {
  return (
    <Pressable
      testID={TestIds.detailsBack}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={(sizes.minTouchTarget - sizes.backButton) / 2}
      style={[styles.back, { top: top + spacing.sm }]}
    >
      <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textStrong} />
    </Pressable>
  );
}

function Summary({ product }: { product: ProductSummary }) {
  return (
    <View style={styles.summary}>
      {product.brand ? (
        <Text style={styles.brand} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {product.brand}
        </Text>
      ) : null}
      <Text
        testID={TestIds.detailsTitle}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {product.title}
      </Text>
      <View style={styles.category}>
        <Text style={styles.categoryText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {product.category}
        </Text>
      </View>
      <ProductPriceBlock price={product.price} discountPercentage={product.discountPercentage} />
      <ProductRatingRow
        rating={product.rating}
        reviewCount={isFullProduct(product) ? product.reviews.length : undefined}
      />
      <AvailabilityChip availability={product.availability} stock={product.stock} />
    </View>
  );
}

function FullDetails({ product }: { product: Product }) {
  return (
    <View style={styles.sections}>
      <View style={styles.section} testID={TestIds.detailsDescription}>
        <SectionHeader title="Description" />
        <Text style={styles.description} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {product.description}
        </Text>
      </View>
      <ProductSpecs product={product} />
      <ReviewList reviews={product.reviews} />
    </View>
  );
}

/** Product details screen. Pure: every state comes from props, every action goes out. */
export function ProductDetailsView({
  product,
  isPlaceholder,
  status,
  error,
  isOnline,
  isInvalidId,
  onRetry,
  onBack,
}: ProductDetailsViewProps) {
  const insets = useSafeAreaInsets();

  const renderBody = (): ReactNode => {
    if (isInvalidId || error?.isNotFound) return <NotFoundState onBack={onBack} />;

    if (!product) {
      if (!isOnline && status !== 'success') return <OfflineState onRetry={onRetry} />;
      if (status === 'error') return <ErrorState error={error} onRetry={onRetry} />;
      return <ProductDetailsSkeleton />;
    }

    const images =
      !isPlaceholder && isFullProduct(product) && product.images.length > 0
        ? product.images
        : [product.thumbnailUrl];

    let rest: ReactNode;
    if (!isPlaceholder && isFullProduct(product)) rest = <FullDetails product={product} />;
    else if (status === 'error') rest = <ErrorState error={error} onRetry={onRetry} />;
    else if (!isOnline) rest = <OfflineState onRetry={onRetry} />;
    else rest = <ProductDetailsSkeleton variant="body" />;

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
        <View style={{ paddingTop: insets.top }}>
          <ProductImageCarousel images={images} title={product.title} />
        </View>
        <Summary product={product} />
        {rest}
      </ScrollView>
    );
  };

  const hasOwnBackAction = isInvalidId || Boolean(error?.isNotFound);

  return (
    <View style={styles.screen} testID={TestIds.productDetails}>
      <View style={[styles.body, !product && { paddingTop: insets.top }]}>{renderBody()}</View>
      {/* Opaque status bar area so scrolled content never sits under the clock. */}
      <View
        testID={TestIds.detailsStatusScrim}
        style={[styles.statusScrim, { height: insets.top }]}
        pointerEvents="none"
      />
      {hasOwnBackAction ? null : <BackButton onPress={onBack} top={insets.top} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  statusScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  },
  back: {
    position: 'absolute',
    left: spacing.lg,
    width: sizes.backButton,
    height: sizes.backButton,
    borderRadius: sizes.backButton / 2,
    backgroundColor: colors.white,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { gap: spacing.md, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  brand: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.6 },
  title: typography.title,
  category: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: { ...typography.label, color: colors.textSecondaryAA },
  sections: { gap: spacing.xxl, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxl },
  section: { gap: spacing.sm },
  description: typography.body,
});
