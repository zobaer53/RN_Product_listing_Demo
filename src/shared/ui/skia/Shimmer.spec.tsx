import { isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { useReducedMotion, withRepeat } from 'react-native-reanimated';

import { Shimmer } from './Shimmer';

jest.mock('react-native-reanimated', () => {
  const actual =
    jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  return {
    ...actual,
    useReducedMotion: jest.fn(() => false),
    withRepeat: jest.fn(actual.withRepeat),
  };
});

const mockedReducedMotion = jest.mocked(useReducedMotion);
const mockedWithRepeat = jest.mocked(withRepeat);

describe('Shimmer', () => {
  beforeEach(() => {
    mockedWithRepeat.mockClear();
  });

  it('[SH-02] animates the sweep when motion is allowed', async () => {
    mockedReducedMotion.mockReturnValue(false);
    await render(<Shimmer height={20} testID="shimmer" />);
    expect(screen.getByTestId('shimmer')).toBeOnTheScreen();
    expect(mockedWithRepeat).toHaveBeenCalled();
  });

  it('[SH-02] stays static when Reduce Motion is on', async () => {
    mockedReducedMotion.mockReturnValue(true);
    await render(<Shimmer height={20} testID="shimmer" />);
    expect(screen.getByTestId('shimmer')).toBeOnTheScreen();
    expect(mockedWithRepeat).not.toHaveBeenCalled();
  });

  it('[SH-02] is hidden from assistive technologies', async () => {
    mockedReducedMotion.mockReturnValue(false);
    await render(<Shimmer height={20} width={120} testID="shimmer" />);
    expect(isHiddenFromAccessibility(screen.getByTestId('shimmer'))).toBe(true);
  });
});
