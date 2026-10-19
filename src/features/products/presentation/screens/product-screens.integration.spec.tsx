import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import type { ReactNode } from 'react';

import { useConnectivityStore } from '@core/connectivity/connectivity.store';
import { TestIds } from '@shared/testing/test-ids';
import { TestProviders } from '@shared/testing/render-with-providers';
import { createTestQueryClient } from '@tests/utils/query-test-utils';

import { ProductDetailsScreen } from './ProductDetailsScreen';
import { ProductListScreen } from './ProductListScreen';

const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: ProductListScreen,
  'products/[id]': ProductDetailsScreen,
};

const renderApp = (initialUrl = '/') => {
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <TestProviders>{children}</TestProviders>
    </QueryClientProvider>
  );
  return renderRouter(routes, { initialUrl, wrapper });
};

describe('product screens (integration)', () => {
  beforeEach(() => useConnectivityStore.setState({ isOnline: true }));

  it('[INT-01] loads the first page of products from the API', async () => {
    await renderApp();
    expect(await screen.findByTestId(TestIds.productCard(1))).toBeOnTheScreen();
    expect(screen.getByText('Essence Mascara Lash Princess')).toBeOnTheScreen();
  });

  it('[INT-02] opens the details of a pressed product', async () => {
    const router = await renderApp();
    fireEvent.press(await screen.findByTestId(TestIds.productCard(1)));
    expect(router.getPathname()).toBe('/products/1');
    expect(await screen.findByTestId(TestIds.detailsDescription)).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.detailsTitle)).toHaveTextContent(
      'Essence Mascara Lash Princess',
    );
  });

  it('[INT-03] deep link with an invalid id shows not found without a request', async () => {
    await renderApp('/products/abc');
    expect(await screen.findByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
  });

  it('[INT-04] deep link to an unknown product shows not found', async () => {
    await renderApp('/products/99999');
    expect(await screen.findByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
  });

  it('[INT-05] back from a deep-linked details screen returns to the list', async () => {
    const router = await renderApp('/products/1');
    fireEvent.press(await screen.findByTestId(TestIds.detailsBack));
    expect(router.getPathname()).toBe('/');
    expect(await screen.findByTestId(TestIds.productCard(1))).toBeOnTheScreen();
  });
});
