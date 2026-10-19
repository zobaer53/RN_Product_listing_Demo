export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock';

/** The subset of a product the listing needs. */
export interface ProductSummary {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  thumbnailUrl: string;
  stock: number;
  availability: Availability;
}

/** A review as the app keeps it. Reviewer e-mail is intentionally not part of the model. */
export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product extends ProductSummary {
  description: string;
  images: string[];
  tags: string[];
  sku: string;
  weight: number;
  dimensions: Dimensions;
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  reviews: Review[];
}
