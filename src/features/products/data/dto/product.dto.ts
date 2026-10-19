import { z } from 'zod';

/**
 * Wire formats of dummyjson.com. Essentials (id, title, price, thumbnail) are strict;
 * descriptive metadata falls back to neutral defaults so one odd field cannot hide a product.
 * Unknown keys are accepted and stripped.
 */

const LIST_FIELDS = [
  'id',
  'title',
  'brand',
  'category',
  'price',
  'discountPercentage',
  'rating',
  'thumbnail',
  'stock',
  'availabilityStatus',
] as const;

/** `select` query value for list requests. */
export const PRODUCT_LIST_FIELDS = LIST_FIELDS.join(',');

const lenientString = z.string().catch('');
const lenientNumber = z.number().catch(0);

export const productSummaryDtoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().nonnegative(),
  thumbnail: z.string(),
  brand: z.string().optional().catch(undefined),
  category: lenientString,
  discountPercentage: lenientNumber,
  rating: lenientNumber,
  stock: lenientNumber,
  availabilityStatus: z.string().optional().catch(undefined),
});

export const productListDtoSchema = z.object({
  products: z.array(productSummaryDtoSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export const reviewDtoSchema = z.object({
  rating: lenientNumber,
  comment: lenientString,
  date: lenientString,
  reviewerName: lenientString,
  /** Personal data: parsed for completeness, dropped by the mapper. */
  reviewerEmail: z.string().optional(),
});

export const productDtoSchema = productSummaryDtoSchema.extend({
  description: lenientString,
  images: z.array(z.string()).catch([]),
  tags: z.array(z.string()).catch([]),
  sku: lenientString,
  weight: lenientNumber,
  dimensions: z
    .object({ width: lenientNumber, height: lenientNumber, depth: lenientNumber })
    .catch({ width: 0, height: 0, depth: 0 }),
  warrantyInformation: lenientString,
  shippingInformation: lenientString,
  returnPolicy: lenientString,
  minimumOrderQuantity: z.number().int().positive().catch(1),
  reviews: z.array(reviewDtoSchema).catch([]),
});

export type ProductSummaryDto = z.infer<typeof productSummaryDtoSchema>;
export type ProductListDto = z.infer<typeof productListDtoSchema>;
export type ReviewDto = z.infer<typeof reviewDtoSchema>;
export type ProductDto = z.infer<typeof productDtoSchema>;
