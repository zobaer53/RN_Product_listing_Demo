import type { Availability } from '../entities/product';

export const LOW_STOCK_THRESHOLD = 5;

/** Maps raw stock data to the availability shown to users. `status` is the API's own label. */
export const availabilityOf = (stock: number, status?: string): Availability => {
  const normalized = status?.trim().toLowerCase();
  if (stock <= 0 || normalized === 'out of stock') return 'out_of_stock';
  if (stock <= LOW_STOCK_THRESHOLD || normalized === 'low stock') return 'low_stock';
  return 'in_stock';
};
