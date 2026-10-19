import { isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';

import { RatingStars, StarIcon, starFills } from './RatingStars';

describe('RatingStars', () => {
  it.each([
    [0, [0, 0, 0, 0, 0]],
    [2.56, [1, 1, 0.56, 0, 0]],
    [5, [1, 1, 1, 1, 1]],
  ])('[SH-01] fills stars for rating %p', (rating, expected) => {
    const fills = starFills(rating);
    expect(fills).toHaveLength(5);
    fills.forEach((fill, index) => expect(fill).toBeCloseTo(expected[index] ?? -1, 5));
  });

  it('[SH-01] clamps ratings outside 0..5', () => {
    expect(starFills(-1)).toEqual([0, 0, 0, 0, 0]);
    expect(starFills(7)).toEqual([1, 1, 1, 1, 1]);
    expect(starFills(Number.NaN)).toEqual([0, 0, 0, 0, 0]);
  });

  it.each([
    [0, 'Rated 0.0 out of 5'],
    [2.56, 'Rated 2.6 out of 5'],
    [5, 'Rated 5.0 out of 5'],
  ])('[SH-01] announces rating %p as an image', async (rating, label) => {
    await render(<RatingStars rating={rating} />);
    expect(screen.getByRole('image', { name: label })).toBeOnTheScreen();
  });

  it('[SH-01] forwards testID', async () => {
    await render(<RatingStars rating={3} testID="stars" />);
    expect(screen.getByTestId('stars')).toBeOnTheScreen();
  });

  it('[SH-01] StarIcon is decorative', async () => {
    await render(<StarIcon testID="star" />);
    expect(isHiddenFromAccessibility(screen.getByTestId('star'))).toBe(true);
  });
});
