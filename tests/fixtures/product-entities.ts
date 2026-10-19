import type { Product, ProductSummary } from '@features/products/domain/entities/product';

/** Hand-written domain fixtures for presentation tests (no network shapes here). */
export const makeProductSummary = (overrides: Partial<ProductSummary> = {}): ProductSummary => ({
  id: 1,
  title: 'Essence Mascara Lash Princess',
  brand: 'Essence',
  category: 'beauty',
  price: 9.99,
  discountPercentage: 10.48,
  rating: 2.56,
  thumbnailUrl:
    'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
  stock: 99,
  availability: 'in_stock',
  ...overrides,
});

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  ...makeProductSummary(),
  description:
    'The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.',
  images: ['https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp'],
  tags: ['beauty', 'mascara'],
  sku: 'BEA-ESS-ESS-001',
  weight: 4,
  dimensions: { width: 15.14, height: 13.08, depth: 22.99 },
  warrantyInformation: '1 week warranty',
  shippingInformation: 'Ships in 3-5 business days',
  returnPolicy: 'No return policy',
  minimumOrderQuantity: 48,
  reviews: [
    {
      rating: 3,
      comment: 'Would not recommend!',
      date: '2025-04-30T09:41:02.053Z',
      reviewerName: 'Eleanor Collins',
    },
    {
      rating: 4,
      comment: 'Very satisfied!',
      date: '2025-04-30T09:41:02.053Z',
      reviewerName: 'Lucas Gordon',
    },
  ],
  ...overrides,
});

export const makeProductSummaries = (count: number, startId = 1): ProductSummary[] =>
  Array.from({ length: count }, (_, index) =>
    makeProductSummary({ id: startId + index, title: `Product ${startId + index}` }),
  );
