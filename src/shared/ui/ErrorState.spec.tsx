import { screen, userEvent } from '@testing-library/react-native';

import { AppError, type AppErrorKind } from '@core/errors/app-error';

import { renderWithProviders } from '../testing/render-with-providers';
import { TestIds } from '../testing/test-ids';
import { ErrorState, errorCopy } from './ErrorState';

describe('ErrorState', () => {
  it.each<[string, AppError | null, string, string]>([
    [
      'offline',
      new AppError('offline'),
      "You're offline",
      'Connect to the internet to load products.',
    ],
    ['timeout', new AppError('timeout'), 'This is taking too long', 'The server took too long'],
    ['network', new AppError('network'), "Can't reach the server", 'Check your connection'],
    [
      'http 500',
      new AppError('http', 'boom', { status: 500 }),
      'Something went wrong on our side',
      'Our server had a problem',
    ],
    [
      'http 503',
      new AppError('http', 'boom', { status: 503 }),
      'Something went wrong on our side',
      'Our server had a problem',
    ],
    ['parse', new AppError('parse'), 'We received unexpected data', 'Please try again later'],
    ['http 400', new AppError('http', 'bad', { status: 400 }), 'Something went wrong', 'Please'],
    ['unknown', new AppError('unknown'), 'Something went wrong', 'Please'],
    ['null', null, 'Something went wrong', 'Please'],
  ])('[SH-03] shows the copy for %s', async (_label, error, title, message) => {
    await renderWithProviders(<ErrorState error={error} onRetry={jest.fn()} />);
    expect(screen.getByTestId(TestIds.stateError)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: title })).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(message))).toBeOnTheScreen();
  });

  it('[SH-03] maps validation errors like parse errors', () => {
    const kinds: AppErrorKind[] = ['validation', 'parse'];
    const titles = kinds.map((kind) => errorCopy(new AppError(kind)).title);
    expect(titles).toEqual(['We received unexpected data', 'We received unexpected data']);
  });

  it('[SH-03] calls onRetry from the Retry button', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ErrorState error={new AppError('network')} onRetry={onRetry} />);
    const retry = screen.getByTestId(TestIds.stateErrorRetry);
    expect(retry).toHaveAccessibleName('Retry');
    await user.press(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
