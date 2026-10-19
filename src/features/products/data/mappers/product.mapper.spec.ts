import product1 from '@tests/fixtures/product-1.json';
import page0 from '@tests/fixtures/products-page-0.json';
import pageLast from '@tests/fixtures/products-page-last.json';

import { productDtoSchema, productListDtoSchema } from '../dto/product.dto';
import { toProduct, toProductsPage } from './product.mapper';

describe('product mapper', () => {
  it('[DATA-04] maps a list response to a Page of summaries', () => {
    const page = toProductsPage(productListDtoSchema.parse(page0));

    expect(page).toMatchObject({ total: 194, skip: 0, limit: 10 });
    expect(page.items).toHaveLength(10);
    expect(page.items[0]).toEqual({
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
    });
  });

  it('[DATA-04] derives availability from stock and the API status', () => {
    const base = pageLast.products[0]!;
    const page = toProductsPage(
      productListDtoSchema.parse({
        ...pageLast,
        products: [
          { ...base, id: 1, stock: 0, availabilityStatus: 'Out of Stock' },
          { ...base, id: 2, stock: 3, availabilityStatus: 'Low Stock' },
          { ...base, id: 3, stock: 50, availabilityStatus: 'In Stock' },
        ],
      }),
    );

    expect(page.items.map((item) => item.availability)).toEqual([
      'out_of_stock',
      'low_stock',
      'in_stock',
    ]);
    expect(page).toMatchObject({ total: 194, skip: 190, limit: 4 });
  });

  it('[DATA-05] maps full products without reviewer e-mails', () => {
    const product = toProduct(productDtoSchema.parse(product1));

    expect(product.reviews).toEqual([
      {
        rating: 3,
        comment: 'Would not recommend!',
        date: '2025-04-30T09:41:02.053Z',
        reviewerName: 'Eleanor Collins',
      },
      expect.objectContaining({ reviewerName: 'Lucas Gordon' }),
      expect.objectContaining({ reviewerName: 'Eleanor Collins' }),
    ]);
    expect(product.reviews[1]).not.toHaveProperty('reviewerEmail');
    expect(JSON.stringify(product)).not.toContain('@x.dummyjson.com');
    expect(product).toMatchObject({
      description: expect.stringContaining('Essence Mascara'),
      sku: 'BEA-ESS-ESS-001',
      dimensions: { width: 15.14, height: 13.08, depth: 22.99 },
      minimumOrderQuantity: 48,
      availability: 'in_stock',
    });
    expect(product).not.toHaveProperty('meta');
  });

  it('[DATA-08] falls back to the thumbnail when a product has no images', () => {
    const product = toProduct(productDtoSchema.parse({ ...product1, images: [] }));

    expect(product.images).toEqual([product1.thumbnail]);
  });
});
