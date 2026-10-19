import { useLocalSearchParams, useRouter } from 'expo-router';

import { useIsOnline } from '@core/connectivity/connectivity.store';

import { parseProductIdParam } from '../navigation/parse-product-id';
import { useProduct } from '../queries/use-product';
import { ProductDetailsView } from './ProductDetailsView';

/** Container: resolves the route param, loads the product and handles back navigation. */
export function ProductDetailsScreen() {
  const router = useRouter();
  const isOnline = useIsOnline();
  const params = useLocalSearchParams<{ id: string }>();
  const id = parseProductIdParam(params.id);
  const { data, status, error, isPlaceholderData, refetch } = useProduct(id);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ProductDetailsView
      product={data}
      isPlaceholder={isPlaceholderData}
      status={status}
      error={error}
      isOnline={isOnline}
      isInvalidId={id === undefined}
      onRetry={() => void refetch()}
      onBack={goBack}
    />
  );
}
