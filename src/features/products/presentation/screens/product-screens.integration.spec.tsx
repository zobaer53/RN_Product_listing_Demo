import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useConnectivityStore } from '@core/connectivity/connectivity.store';
import { TestProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';
import { createTestQueryClient } from '@tests/utils/query-test-utils';

import { ProductDetailsScreen } from './ProductDetailsScreen';
import { ProductListScreen } from './ProductListScreen';

// Containers are exercised end to end (hooks → use cases → repository → HTTP → MSW); only
// the router is replaced. Real navigation and deep links are covered by the Maestro flows.
const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() };
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));

const renderScreen = (ui: React.ReactElement) => {
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <TestProviders>{children}</TestProviders>
    </QueryClientProvider>
  );
  return render(ui, { wrapper });
};

describe('product screens (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    useConnectivityStore.setState({ isOnline: true });
  });

  it('[INT-01] loads the first page of products from the API', async () => {
    await renderScreen(<ProductListScreen />);
    expect(await screen.findByTestId(TestIds.productCard(1))).toBeOnTheScreen();
    expect(screen.getByText('Essence Mascara Lash Princess')).toBeOnTheScreen();
  });

  it('[INT-02] navigates to the details of a pressed product', async () => {
    await renderScreen(<ProductListScreen />);
    fireEvent.press(await screen.findByTestId(TestIds.productCard(1)));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/products/[id]',
      params: { id: '1' },
    });
  });

  it('[INT-03] details with an invalid id show not found', async () => {
    mockParams = { id: 'abc' };
    await renderScreen(<ProductDetailsScreen />);
    expect(await screen.findByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
  });

  it('[INT-04] details of an unknown product show not found', async () => {
    mockParams = { id: '99999' };
    await renderScreen(<ProductDetailsScreen />);
    expect(await screen.findByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
  });

  it('[INT-05] back without history returns to the list', async () => {
    mockParams = { id: '1' };
    mockRouter.canGoBack.mockReturnValue(false);
    await renderScreen(<ProductDetailsScreen />);
    expect(await screen.findByTestId(TestIds.detailsDescription)).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.detailsTitle)).toHaveTextContent(
      'Essence Mascara Lash Princess',
    );
    fireEvent.press(screen.getByTestId(TestIds.detailsBack));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
  });
});
