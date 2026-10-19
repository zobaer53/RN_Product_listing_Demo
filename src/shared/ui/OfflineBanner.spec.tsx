import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../testing/render-with-providers';
import { TestIds } from '../testing/test-ids';
import { OfflineBanner } from './OfflineBanner';

const NOW = Date.UTC(2026, 9, 19, 12, 0, 0);

describe('OfflineBanner', () => {
  it('[SH-07] tells the user how old the cached data is', async () => {
    await renderWithProviders(<OfflineBanner dataUpdatedAt={NOW - 5 * 60_000} now={NOW} />);
    const banner = screen.getByTestId(TestIds.offlineBanner);
    expect(banner).toHaveTextContent("You're offline · showing data from 5 min ago");
    expect(banner).toHaveProp('accessibilityRole', 'alert');
    expect(banner).toHaveProp('accessibilityLiveRegion', 'polite');
  });

  it('[SH-07] falls back to generic copy when the fetch time is unknown', async () => {
    await renderWithProviders(<OfflineBanner dataUpdatedAt={0} now={NOW} />);
    expect(screen.getByTestId(TestIds.offlineBanner)).toHaveTextContent(
      "You're offline · showing saved data",
    );
  });
});
