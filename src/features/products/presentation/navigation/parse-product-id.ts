import { z } from 'zod';

const productIdParam = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number);

/** Parses the `[id]` route param. Anything but a canonical positive integer is invalid. */
export const parseProductIdParam = (value: string | string[] | undefined): number | undefined => {
  const result = productIdParam.safeParse(value);
  return result.success ? result.data : undefined;
};
