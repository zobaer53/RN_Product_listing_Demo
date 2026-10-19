const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const withThousands = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** US-dollar price with two decimals and `,` separators, independent of device locale. */
export const formatPrice = (value: number): string => {
  // toFixed(6) absorbs binary noise such as 124.995 * 100 = 12499.499999…
  const cents = Math.round(Number((Math.abs(value) * 100).toFixed(6)));
  const whole = Math.floor(cents / 100).toString();
  const fraction = (cents % 100).toString().padStart(2, '0');
  const sign = value < 0 && cents > 0 ? '-' : '';
  return `${sign}$${withThousands(whole)}.${fraction}`;
};

/** Rating with one decimal, e.g. `2.56 → '2.6'`. */
export const formatRating = (rating: number): string => rating.toFixed(1);

/** Whole-percent discount label, floored so we never overstate it: `10.48 → '10% OFF'`. */
export const formatDiscount = (discountPercentage: number): string =>
  `${Math.floor(discountPercentage)}% OFF`;

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

/** Short relative time between two epoch-ms instants, e.g. `'5 min ago'`. */
export const formatRelativeTime = (fromMs: number, nowMs: number): string => {
  const elapsed = nowMs - fromMs;
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} h ago`;
  if (elapsed < MONTH) return plural(Math.floor(elapsed / DAY), 'day');
  if (elapsed < YEAR) return plural(Math.floor(elapsed / MONTH), 'month');
  return plural(Math.floor(elapsed / YEAR), 'year');
};
