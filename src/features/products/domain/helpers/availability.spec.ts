import { availabilityOf, LOW_STOCK_THRESHOLD } from './availability';

describe('availabilityOf', () => {
  it('[DOM-02] is out of stock when stock is 0', () => {
    expect(availabilityOf(0)).toBe('out_of_stock');
    expect(availabilityOf(0, 'In Stock')).toBe('out_of_stock');
  });

  it('[DOM-02] is low stock at or under the threshold', () => {
    expect(availabilityOf(LOW_STOCK_THRESHOLD)).toBe('low_stock');
    expect(availabilityOf(1)).toBe('low_stock');
  });

  it('[DOM-02] trusts the API "Low Stock" status', () => {
    expect(availabilityOf(40, 'Low Stock')).toBe('low_stock');
  });

  it('[DOM-02] trusts the API "Out of Stock" status', () => {
    expect(availabilityOf(40, 'Out of Stock')).toBe('out_of_stock');
  });

  it('[DOM-02] is in stock otherwise', () => {
    expect(availabilityOf(99, 'In Stock')).toBe('in_stock');
    expect(availabilityOf(99)).toBe('in_stock');
  });
});
