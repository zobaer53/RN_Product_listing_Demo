import { render, screen } from '@testing-library/react-native';

import { DiscountRibbon } from './DiscountRibbon';

describe('DiscountRibbon', () => {
  it('[SH-04] shows the floored discount', async () => {
    await render(<DiscountRibbon discountPercentage={10.48} />);
    expect(screen.getByText('10% OFF')).toBeOnTheScreen();
  });

  it.each([0, 0.99, -5])('[SH-04] is hidden for discount %p (< 1)', async (discount) => {
    await render(<DiscountRibbon discountPercentage={discount} />);
    expect(screen.queryByText(/OFF/)).not.toBeOnTheScreen();
  });
});
