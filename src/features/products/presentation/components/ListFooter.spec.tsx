import { screen, userEvent } from '@testing-library/react-native';

import { AppError } from '@core/errors/app-error';
import { renderWithProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';

import { ListFooter, type ListFooterProps } from './ListFooter';

const baseProps: ListFooterProps = {
  isFetchingNextPage: false,
  nextPageError: null,
  hasNextPage: true,
  isOnline: true,
  total: 194,
  onRetry: jest.fn(),
};

const variantIds = [
  TestIds.listFooterLoading,
  TestIds.listFooterError,
  TestIds.listFooterOffline,
  TestIds.listFooterEnd,
];

const expectOnly = (id: string | null) => {
  for (const variant of variantIds) {
    if (variant === id) expect(screen.getByTestId(variant)).toBeOnTheScreen();
    else expect(screen.queryByTestId(variant)).not.toBeOnTheScreen();
  }
};

describe('ListFooter', () => {
  it('[PC-02] shows a spinner while the next page loads', async () => {
    await renderWithProviders(<ListFooter {...baseProps} isFetchingNextPage />);
    expectOnly(TestIds.listFooterLoading);
  });

  it('[PC-02] shows an error with retry when the next page fails', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ListFooter {...baseProps} nextPageError={new AppError('network')} onRetry={onRetry} />,
    );
    expectOnly(TestIds.listFooterError);
    await user.press(screen.getByTestId(TestIds.listFooterRetry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('[PC-02] asks to reconnect when offline with more pages', async () => {
    await renderWithProviders(
      <ListFooter {...baseProps} isOnline={false} nextPageError={new AppError('offline')} />,
    );
    expectOnly(TestIds.listFooterOffline);
    expect(screen.getByText('Connect to load more')).toBeOnTheScreen();
  });

  it('[PC-02] announces the end of the list', async () => {
    await renderWithProviders(<ListFooter {...baseProps} hasNextPage={false} />);
    expectOnly(TestIds.listFooterEnd);
    expect(screen.getByText("You've seen all 194 products")).toBeOnTheScreen();
  });

  it('[PC-02] renders nothing while more pages are available', async () => {
    await renderWithProviders(<ListFooter {...baseProps} />);
    expectOnly(null);
  });
});
