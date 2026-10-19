import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppError } from '@core/errors/app-error';
import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, spacing } from '@shared/theme/tokens';
import { EmptyState } from '@shared/ui/EmptyState';
import { ErrorState } from '@shared/ui/ErrorState';
import { OfflineBanner } from '@shared/ui/OfflineBanner';
import { OfflineState } from '@shared/ui/OfflineState';
import { SectionHeader } from '@shared/ui/SectionHeader';
import { Wordmark } from '@shared/ui/Wordmark';

import { ListFooter } from '../components/ListFooter';
import { ProductGrid } from '../components/ProductGrid';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import type { ProductListViewProps } from './view-contracts';

type Content = 'skeleton' | 'offline' | 'error' | 'empty' | 'grid';

const contentOf = ({ products, status, isOnline }: ProductListViewProps): Content => {
  if (products.length > 0) return 'grid';
  // Offline queries are paused (still `pending`), so check connectivity first.
  if (!isOnline && status !== 'success') return 'offline';
  if (status === 'pending') return 'skeleton';
  if (status === 'error') return 'error';
  return 'empty';
};

/** Product catalogue screen. Pure: every state comes from props, every action goes out. */
export function ProductListView(props: ProductListViewProps) {
  const {
    products,
    total,
    status,
    error,
    isOnline,
    isRefreshing,
    dataUpdatedAt,
    onRefresh,
    onRetry,
    onEndReached,
    onRetryNextPage,
    onPressProduct,
    onPressInProduct,
  } = props;
  const insets = useSafeAreaInsets();
  const [dismissedError, setDismissedError] = useState<AppError | null>(null);

  const content = contentOf(props);
  const showRefreshError =
    content === 'grid' &&
    status === 'error' &&
    isOnline &&
    error !== null &&
    error !== dismissedError;
  const caption =
    total === undefined ? `Showing ${products.length}` : `Showing ${products.length} of ${total}`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Wordmark />
        {!isOnline && products.length > 0 ? <OfflineBanner dataUpdatedAt={dataUpdatedAt} /> : null}
      </View>

      {content === 'skeleton' ? <ProductGridSkeleton /> : null}
      {content === 'offline' ? <OfflineState onRetry={onRetry} /> : null}
      {content === 'error' ? <ErrorState error={error} onRetry={onRetry} /> : null}
      {content === 'empty' ? (
        <EmptyState
          title="No products yet"
          message="Pull down to refresh or check back later."
          actionLabel="Refresh"
          onAction={onRefresh}
        />
      ) : null}
      {content === 'grid' ? (
        <ProductGrid
          products={products}
          isRefreshing={isRefreshing}
          refreshEnabled={isOnline}
          onRefresh={onRefresh}
          onEndReached={onEndReached}
          onPressProduct={onPressProduct}
          onPressInProduct={onPressInProduct}
          header={<SectionHeader title="Products" caption={caption} style={styles.sectionHeader} />}
          footer={
            <View style={{ paddingBottom: insets.bottom }}>
              <ListFooter
                isFetchingNextPage={props.isFetchingNextPage}
                nextPageError={props.nextPageError}
                hasNextPage={props.hasNextPage}
                isOnline={isOnline}
                total={total}
                onRetry={onRetryNextPage}
              />
            </View>
          }
        />
      ) : null}

      <Snackbar
        visible={showRefreshError}
        onDismiss={() => setDismissedError(error)}
        testID={TestIds.snackbarRefreshError}
        action={{ label: 'Retry', onPress: onRetry, accessibilityLabel: 'Retry' }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        wrapperStyle={{ paddingBottom: insets.bottom }}
      >
        {"Couldn't refresh"}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
});
