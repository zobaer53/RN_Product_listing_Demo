import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import type { ReactElement } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, spacing } from '@shared/theme/tokens';

import type { ProductSummary } from '../../domain/entities/product';
import { ProductCard } from './ProductCard';

const COLUMNS = 2;
const END_REACHED_THRESHOLD = 0.5;

export interface ProductGridProps {
  products: ProductSummary[];
  isRefreshing: boolean;
  /** Pull to refresh is only offered when true (e.g. online). */
  refreshEnabled: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onPressProduct: (id: number) => void;
  onPressInProduct?: (id: number) => void;
  header?: ReactElement | null;
  footer?: ReactElement | null;
}

const keyExtractor = (product: ProductSummary) => String(product.id);

/** Two-column, virtualised product grid with pull to refresh and infinite scroll. */
export function ProductGrid({
  products,
  isRefreshing,
  refreshEnabled,
  onRefresh,
  onEndReached,
  onPressProduct,
  onPressInProduct,
  header,
  footer,
}: ProductGridProps) {
  const renderItem = ({ item, index }: ListRenderItemInfo<ProductSummary>) => (
    <View style={index % COLUMNS === 0 ? styles.leftCell : styles.rightCell}>
      <ProductCard product={item} onPress={onPressProduct} onPressIn={onPressInProduct} />
    </View>
  );

  return (
    <FlashList
      testID={TestIds.productList}
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={COLUMNS}
      onEndReached={onEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      refreshControl={
        refreshEnabled ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      contentContainerStyle={styles.content}
    />
  );
}

const HALF_GAP = spacing.columnGap / 2;

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xxl },
  leftCell: { flex: 1, paddingRight: HALF_GAP, paddingBottom: spacing.xl },
  rightCell: { flex: 1, paddingLeft: HALF_GAP, paddingBottom: spacing.xl },
});
