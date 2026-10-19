import { formatDiscount, formatPrice, formatRating, formatRelativeTime } from './format';

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('format', () => {
  describe('formatPrice', () => {
    it('[FMT-01] formats dollars with two decimals', () => {
      expect(formatPrice(9.99)).toBe('$9.99');
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(0)).toBe('$0.00');
      expect(formatPrice(12.5)).toBe('$12.50');
    });

    it('[FMT-01] adds thousands separators independently of the device locale', () => {
      expect(formatPrice(1299)).toBe('$1,299.00');
      expect(formatPrice(1234567.891)).toBe('$1,234,567.89');
    });

    it('[FMT-01] rounds to cents', () => {
      expect(formatPrice(124.995)).toBe('$125.00');
      expect(formatPrice(0.005)).toBe('$0.01');
    });
  });

  describe('formatRating', () => {
    it('[FMT-02] keeps one decimal', () => {
      expect(formatRating(2.56)).toBe('2.6');
      expect(formatRating(5)).toBe('5.0');
      expect(formatRating(0)).toBe('0.0');
      expect(formatRating(4.94)).toBe('4.9');
    });
  });

  describe('formatDiscount', () => {
    it('[FMT-03] floors the percentage', () => {
      expect(formatDiscount(10.48)).toBe('10% OFF');
      expect(formatDiscount(19.99)).toBe('19% OFF');
      expect(formatDiscount(1)).toBe('1% OFF');
    });
  });

  describe('formatRelativeTime', () => {
    const now = Date.UTC(2026, 9, 19, 12, 0, 0);

    it('[FMT-04] says "just now" under a minute and for future timestamps', () => {
      expect(formatRelativeTime(now, now)).toBe('just now');
      expect(formatRelativeTime(now - 59 * SECOND, now)).toBe('just now');
      expect(formatRelativeTime(now + 5 * MINUTE, now)).toBe('just now');
    });

    it('[FMT-04] uses minutes, hours and days', () => {
      expect(formatRelativeTime(now - 5 * MINUTE, now)).toBe('5 min ago');
      expect(formatRelativeTime(now - 59 * MINUTE, now)).toBe('59 min ago');
      expect(formatRelativeTime(now - 3 * HOUR, now)).toBe('3 h ago');
      expect(formatRelativeTime(now - DAY, now)).toBe('1 day ago');
      expect(formatRelativeTime(now - 2 * DAY, now)).toBe('2 days ago');
    });

    it('[FMT-04] uses months and years for older dates', () => {
      expect(formatRelativeTime(now - 45 * DAY, now)).toBe('1 month ago');
      expect(formatRelativeTime(now - 200 * DAY, now)).toBe('6 months ago');
      expect(formatRelativeTime(now - 400 * DAY, now)).toBe('1 year ago');
      expect(formatRelativeTime(now - 800 * DAY, now)).toBe('2 years ago');
    });
  });
});
