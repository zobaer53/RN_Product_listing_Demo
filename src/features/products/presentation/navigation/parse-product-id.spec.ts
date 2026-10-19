import { parseProductIdParam } from './parse-product-id';

describe('parseProductIdParam', () => {
  it('[ROUTE-01] accepts positive integer ids', () => {
    expect(parseProductIdParam('5')).toBe(5);
    expect(parseProductIdParam('194')).toBe(194);
  });

  it.each([undefined, '', 'abc', '0', '-1', '1.5', '05', '5abc', ['5', '6']])(
    '[ROUTE-01] rejects %p',
    (value) => {
      expect(parseProductIdParam(value)).toBeUndefined();
    },
  );
});
