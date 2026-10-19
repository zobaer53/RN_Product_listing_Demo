import { toAppError } from '@core/errors/to-app-error';
import product1 from '@tests/fixtures/product-1.json';
import page0 from '@tests/fixtures/products-page-0.json';
import page1 from '@tests/fixtures/products-page-1.json';
import pageLast from '@tests/fixtures/products-page-last.json';

import { PRODUCT_LIST_FIELDS, productDtoSchema, productListDtoSchema } from './product.dto';

describe('product DTO schemas', () => {
  it.each([
    ['first', page0],
    ['second', page1],
    ['last', pageLast],
  ])('[DATA-01] accepts the real %s list page', (_name, fixture) => {
    const result = productListDtoSchema.safeParse(fixture);

    expect(result.success).toBe(true);
    expect(result.data?.products).toHaveLength(fixture.products.length);
    expect(result.data?.total).toBe(194);
  });

  it('[DATA-01] accepts the real product details payload', () => {
    const result = productDtoSchema.safeParse(product1);

    expect(result.success).toBe(true);
    expect(result.data?.reviews).toHaveLength(3);
  });

  it.each(['id', 'price', 'title', 'thumbnail'])(
    '[DATA-02] rejects a list item without %s as a parse error with its path',
    (field) => {
      const [first, ...rest] = page0.products;
      const broken = { ...page0, products: [...rest, { ...first, [field]: undefined }] };

      const result = productListDtoSchema.safeParse(broken);
      if (result.success) throw new Error('expected failure');
      const error = toAppError(result.error);

      expect(error.kind).toBe('parse');
      expect(error.issues.join('\n')).toContain(`products.${rest.length}.${field}`);
    },
  );

  it('[DATA-03] accepts items without brand and fills lenient defaults for metadata', () => {
    const { brand: _brand, ...withoutBrand } = page0.products[0]!;
    const list = productListDtoSchema.parse({ ...page0, products: [withoutBrand] });
    const product = productDtoSchema.parse({
      id: 5,
      title: 'Bare product',
      price: 1,
      thumbnail: 'https://cdn.example.com/t.webp',
      extraField: 'ignored',
    });

    expect(list.products[0]?.brand).toBeUndefined();
    expect(product.brand).toBeUndefined();
    expect(product).not.toHaveProperty('extraField');
    expect(product).toMatchObject({
      category: '',
      description: '',
      tags: [],
      images: [],
      reviews: [],
      dimensions: { width: 0, height: 0, depth: 0 },
    });
  });

  it('[DATA-06] requests only the fields the list needs', () => {
    expect(PRODUCT_LIST_FIELDS).toBe(
      'id,title,brand,category,price,discountPercentage,rating,thumbnail,stock,availabilityStatus',
    );
  });
});
