import { screen, userEvent, within } from '@testing-library/react-native';

import { AppError } from '@core/errors/app-error';
import { renderWithProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';
import { makeProductSummaries, makeProductSummary } from '@tests/fixtures/product-entities';

import { ProductListView } from './ProductListView';
import type { ProductListViewProps } from './view-contracts';

const NOW = Date.now();

const makeProps = (overrides: Partial<ProductListViewProps> = {}): ProductListViewProps => ({
  products: [],
  total: undefined,
  status: 'pending',
  error: null,
  isOnline: true,
  isRefreshing: false,
  dataUpdatedAt: 0,
  hasNextPage: true,
  isFetchingNextPage: false,
  nextPageError: null,
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onEndReached: jest.fn(),
  onRetryNextPage: jest.fn(),
  onPressProduct: jest.fn(),
  ...overrides,
});

const loaded = (overrides: Partial<ProductListViewProps> = {}) =>
  makeProps({
    products: makeProductSummaries(10),
    total: 194,
    status: 'success',
    dataUpdatedAt: NOW - 5 * 60_000,
    ...overrides,
  });

describe('ProductListView', () => {
  it('[LIST-01] shows the skeleton while the first page is pending', async () => {
    await renderWithProviders(<ProductListView {...makeProps()} />);
    expect(screen.getByTestId(TestIds.stateLoading)).toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.productList)).not.toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Product Explorer' })).toBeOnTheScreen();
  });

  it('[LIST-02] renders 10 cards with title, price and rating', async () => {
    await renderWithProviders(<ProductListView {...loaded()} />);
    expect(screen.getByTestId(TestIds.productList)).toBeOnTheScreen();
    for (let id = 1; id <= 10; id += 1) {
      const card = screen.getByTestId(TestIds.productCard(id));
      expect(within(card).getByText(`Product ${id}`)).toBeOnTheScreen();
      expect(within(card).getByText('$9.99')).toBeOnTheScreen();
      expect(within(card).getByText('2.6')).toBeOnTheScreen();
    }
    expect(screen.getByRole('header', { name: 'Products' })).toBeOnTheScreen();
    expect(screen.getByText('Showing 10 of 194')).toBeOnTheScreen();
  });

  it('[LIST-03] shows the empty state when the catalogue is empty', async () => {
    const onRefresh = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductListView {...loaded({ products: [], total: 0, hasNextPage: false, onRefresh })} />,
    );
    expect(screen.getByTestId(TestIds.stateEmpty)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('[LIST-04] shows the error state and retries', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductListView
        {...makeProps({
          status: 'error',
          error: new AppError('http', 'boom', { status: 500 }),
          onRetry,
        })}
      />,
    );
    expect(screen.getByTestId(TestIds.stateError)).toBeOnTheScreen();
    expect(screen.getByText('Something went wrong on our side')).toBeOnTheScreen();
    await user.press(screen.getByTestId(TestIds.stateErrorRetry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('[LIST-05] shows the footer spinner while the next page loads', async () => {
    await renderWithProviders(<ProductListView {...loaded({ isFetchingNextPage: true })} />);
    expect(screen.getByTestId(TestIds.listFooterLoading)).toBeOnTheScreen();
  });

  it('[LIST-06] shows footer retry when page 2 fails and keeps existing cards', async () => {
    const onRetryNextPage = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductListView
        {...loaded({
          nextPageError: new AppError('http', 'boom', { status: 500 }),
          onRetryNextPage,
        })}
      />,
    );
    expect(screen.getByTestId(TestIds.listFooterError)).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.productCard(1))).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.productCard(10))).toBeOnTheScreen();
    await user.press(screen.getByTestId(TestIds.listFooterRetry));
    expect(onRetryNextPage).toHaveBeenCalledTimes(1);
  });

  it("[LIST-07] tells the user they've reached the end", async () => {
    await renderWithProviders(<ProductListView {...loaded({ hasNextPage: false })} />);
    expect(screen.getByTestId(TestIds.listFooterEnd)).toHaveTextContent(
      "You've seen all 194 products",
    );
  });

  it('[LIST-08] shows the offline banner over cached data and disables refresh', async () => {
    await renderWithProviders(<ProductListView {...loaded({ isOnline: false })} />);
    expect(screen.getByTestId(TestIds.offlineBanner)).toHaveAccessibleName(
      "You're offline · showing data from 5 min ago",
    );
    expect(screen.getByTestId(TestIds.productCard(1))).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.productList).props.refreshControl).toBeUndefined();
    expect(screen.getByTestId(TestIds.listFooterOffline)).toBeOnTheScreen();
  });

  it('[LIST-08] hides the offline banner when online', async () => {
    await renderWithProviders(<ProductListView {...loaded()} />);
    expect(screen.queryByTestId(TestIds.offlineBanner)).not.toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.productList).props.refreshControl).toBeDefined();
  });

  it.each(['pending', 'error'] as const)(
    '[LIST-09] shows the offline state without cached data (status %s)',
    async (status) => {
      const onRetry = jest.fn();
      const user = userEvent.setup();
      await renderWithProviders(
        <ProductListView
          {...makeProps({
            status,
            isOnline: false,
            error: status === 'error' ? new AppError('offline') : null,
            onRetry,
          })}
        />,
      );
      expect(screen.getByTestId(TestIds.stateOffline)).toBeOnTheScreen();
      expect(screen.queryByTestId(TestIds.stateLoading)).not.toBeOnTheScreen();
      await user.press(screen.getByTestId(TestIds.stateOfflineRetry));
      expect(onRetry).toHaveBeenCalledTimes(1);
    },
  );

  it('[LIST-10] reports the pressed product id', async () => {
    const onPressProduct = jest.fn();
    const onPressInProduct = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductListView {...loaded({ onPressProduct, onPressInProduct })} />,
    );
    await user.press(screen.getByTestId(TestIds.productCard(4)));
    expect(onPressProduct).toHaveBeenCalledWith(4);
    expect(onPressInProduct).toHaveBeenCalledWith(4);
  });

  it('[LIST-11] shows the ribbon for 10.48% and hides it for 0%', async () => {
    const products = [
      makeProductSummary({ id: 1, discountPercentage: 10.48 }),
      makeProductSummary({ id: 2, title: 'No deal', discountPercentage: 0 }),
    ];
    await renderWithProviders(<ProductListView {...loaded({ products, total: 2 })} />);
    expect(
      within(screen.getByTestId(TestIds.productCard(1))).getByText('10% OFF'),
    ).toBeOnTheScreen();
    expect(
      within(screen.getByTestId(TestIds.productCard(2))).queryByText(/OFF/),
    ).not.toBeOnTheScreen();
  });

  it('[LIST-12] exposes each card as a labelled button', async () => {
    await renderWithProviders(<ProductListView {...loaded()} />);
    expect(screen.getByRole('button', { name: 'Product 3, $9.99, rated 2.6 out of 5' })).toHaveProp(
      'testID',
      TestIds.productCard(3),
    );
  });

  it('[LIST-13] keeps data and offers a retry snackbar when a refresh fails', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductListView {...loaded({ status: 'error', error: new AppError('timeout'), onRetry })} />,
    );
    expect(screen.getByTestId(TestIds.productCard(1))).toBeOnTheScreen();
    const snackbar = screen.getByTestId(TestIds.snackbarRefreshError);
    expect(within(snackbar).getByText("Couldn't refresh")).toBeOnTheScreen();
    await user.press(within(snackbar).getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('[LIST-13] does not show the snackbar without an error', async () => {
    await renderWithProviders(<ProductListView {...loaded()} />);
    expect(screen.queryByTestId(TestIds.snackbarRefreshError)).not.toBeOnTheScreen();
  });
});
