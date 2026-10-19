import { screen, userEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text, type RefreshControlProps } from 'react-native';

import { renderWithProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';
import { makeProductSummaries } from '@tests/fixtures/product-entities';

import { ProductGrid, type ProductGridProps } from './ProductGrid';
import { ProductGridSkeleton } from './ProductGridSkeleton';

const props = (overrides: Partial<ProductGridProps> = {}): ProductGridProps => ({
  products: makeProductSummaries(4),
  isRefreshing: false,
  refreshEnabled: true,
  onRefresh: jest.fn(),
  onEndReached: jest.fn(),
  onPressProduct: jest.fn(),
  ...overrides,
});

const refreshControlOf = () =>
  screen.getByTestId(TestIds.productList).props.refreshControl as
    ReactElement<RefreshControlProps> | undefined;

describe('ProductGrid', () => {
  it('[PC-03] renders a card per product with header and footer slots', async () => {
    await renderWithProviders(
      <ProductGrid {...props()} header={<Text>Header</Text>} footer={<Text>Footer</Text>} />,
    );
    expect(screen.getByTestId(TestIds.productList)).toBeOnTheScreen();
    for (const id of [1, 2, 3, 4]) {
      expect(screen.getByTestId(TestIds.productCard(id))).toBeOnTheScreen();
    }
    expect(screen.getByText('Header')).toBeOnTheScreen();
    expect(screen.getByText('Footer')).toBeOnTheScreen();
  });

  it('[PC-03] forwards card presses', async () => {
    const onPressProduct = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ProductGrid {...props({ onPressProduct })} />);
    await user.press(screen.getByTestId(TestIds.productCard(3)));
    expect(onPressProduct).toHaveBeenCalledWith(3);
  });

  it('[PC-03] wires pull to refresh', async () => {
    const onRefresh = jest.fn();
    await renderWithProviders(<ProductGrid {...props({ onRefresh, isRefreshing: true })} />);
    const control = refreshControlOf();
    expect(control?.props.refreshing).toBe(true);
    control?.props.onRefresh?.();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('[PC-03] disables pull to refresh when asked', async () => {
    await renderWithProviders(<ProductGrid {...props({ refreshEnabled: false })} />);
    expect(refreshControlOf()).toBeUndefined();
  });

  it('[PC-12] keeps item positions stable when content above the list changes', async () => {
    // An append-only grid must not shift rows when the banner or header resizes.
    await renderWithProviders(<ProductGrid {...props()} />);
    expect(screen.getByTestId(TestIds.productList)).toHaveProp('maintainVisibleContentPosition', {
      disabled: true,
    });
  });
});

describe('ProductGridSkeleton', () => {
  it('[PC-04] shows six placeholder cards and announces loading', async () => {
    await renderWithProviders(<ProductGridSkeleton />);
    const skeleton = screen.getByTestId(TestIds.stateLoading);
    expect(skeleton).toHaveAccessibleName('Loading products');
    expect(
      screen.getAllByTestId('product-card-skeleton', { includeHiddenElements: true }),
    ).toHaveLength(6);
  });
});
