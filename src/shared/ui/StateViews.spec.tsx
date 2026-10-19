import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '../testing/render-with-providers';
import { TestIds } from '../testing/test-ids';
import { EmptyState } from './EmptyState';
import { NotFoundState } from './NotFoundState';
import { OfflineState } from './OfflineState';

describe('state views', () => {
  it('[SH-06] EmptyState shows its title and message', async () => {
    await renderWithProviders(<EmptyState title="No products" message="Check back later." />);
    expect(screen.getByTestId(TestIds.stateEmpty)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'No products' })).toBeOnTheScreen();
    expect(screen.getByText('Check back later.')).toBeOnTheScreen();
  });

  it('[SH-06] EmptyState offers an optional action', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <EmptyState title="No products" actionLabel="Refresh" onAction={onAction} />,
    );
    await user.press(screen.getByRole('button', { name: 'Refresh' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('[SH-06] OfflineState explains how to recover and retries', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<OfflineState onRetry={onRetry} />);
    expect(screen.getByTestId(TestIds.stateOffline)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: "You're offline" })).toBeOnTheScreen();
    expect(screen.getByText('Connect to the internet to load products.')).toBeOnTheScreen();
    await user.press(screen.getByTestId(TestIds.stateOfflineRetry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('[SH-06] NotFoundState goes back', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<NotFoundState onBack={onBack} />);
    expect(screen.getByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: "We couldn't find that" })).toBeOnTheScreen();
    await user.press(screen.getByTestId(TestIds.stateNotFoundBack));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
