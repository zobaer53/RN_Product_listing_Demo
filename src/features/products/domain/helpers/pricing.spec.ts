import { originalPrice } from './pricing';

describe('originalPrice', () => {
  it('[DOM-01] derives the pre-discount price', () => {
    expect(originalPrice(100, 20)).toBeCloseTo(125);
  });

  it('[DOM-01] returns the price unchanged when there is no discount', () => {
    expect(originalPrice(100, 0)).toBe(100);
  });

  it('[DOM-01] rounds to cents', () => {
    expect(originalPrice(9.99, 10.48)).toBe(11.16);
  });

  it('[DOM-01] ignores invalid discounts (negative or >= 100)', () => {
    expect(originalPrice(50, -5)).toBe(50);
    expect(originalPrice(50, 100)).toBe(50);
  });
});
