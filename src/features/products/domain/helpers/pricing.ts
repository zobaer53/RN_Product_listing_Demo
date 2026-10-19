const roundToCents = (value: number): number => Math.round(value * 100) / 100;

/** Price before the discount was applied, rounded to cents. */
export const originalPrice = (price: number, discountPercentage: number): number => {
  if (discountPercentage <= 0 || discountPercentage >= 100) return price;
  return roundToCents(price / (1 - discountPercentage / 100));
};
