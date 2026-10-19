import { isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';

import { StateIllustration, type StateIllustrationVariant } from './StateIllustration';

const variants: StateIllustrationVariant[] = ['empty', 'offline', 'error', 'notFound'];

describe('StateIllustration', () => {
  it.each(variants)('[SH-05] renders the %s variant as decorative', async (variant) => {
    await render(<StateIllustration variant={variant} testID="illustration" />);
    const illustration = screen.getByTestId('illustration');
    expect(illustration).toBeOnTheScreen();
    expect(isHiddenFromAccessibility(illustration)).toBe(true);
  });
});
