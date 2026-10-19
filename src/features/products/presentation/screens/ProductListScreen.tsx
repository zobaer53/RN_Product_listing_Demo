import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useIsOnline } from '@core/connectivity/connectivity.store';

import { usePrefetchProduct } from '../queries/use-product';
import { useProductsInfinite } from '../queries/use-products-infinite';
import { ProductListView } from './ProductListView';

/** Container: connects the paginated product query and navigation to the list view. */
export function ProductListScreen() {
  const router = useRouter();
  const isOnline = useIsOnline();
  const prefetchProduct = usePrefetchProduct();
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const {
    data,
    status,
    error,
    dataUpdatedAt,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
  } = useProductsInfinite();

  const refresh = async () => {
    setIsPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  };

  const loadMore = () => {
    if (isOnline && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  };

  return (
    <ProductListView
      products={data?.products ?? []}
      total={data?.total}
      status={status}
      error={isFetchNextPageError ? null : error}
      isOnline={isOnline}
      isRefreshing={isPullRefreshing}
      dataUpdatedAt={dataUpdatedAt}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      nextPageError={isFetchNextPageError ? error : null}
      onRefresh={() => void refresh()}
      onRetry={() => void refetch()}
      onEndReached={loadMore}
      onRetryNextPage={() => void fetchNextPage()}
      onPressProduct={(id) =>
        router.push({ pathname: '/products/[id]', params: { id: String(id) } })
      }
      onPressInProduct={(id) => void prefetchProduct(id)}
    />
  );
}
