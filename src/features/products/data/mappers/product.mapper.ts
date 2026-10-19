import type { Page } from '../../domain/entities/page';
import type { Product, ProductSummary, Review } from '../../domain/entities/product';
import { availabilityOf } from '../../domain/helpers/availability';
import type { ProductDto, ProductListDto, ProductSummaryDto, ReviewDto } from '../dto/product.dto';

/** Fields are copied explicitly so nothing unexpected (e.g. personal data) leaks into the model. */
export const toProductSummary = (dto: ProductSummaryDto): ProductSummary => ({
  id: dto.id,
  title: dto.title,
  brand: dto.brand || undefined,
  category: dto.category,
  price: dto.price,
  discountPercentage: dto.discountPercentage,
  rating: dto.rating,
  thumbnailUrl: dto.thumbnail,
  stock: dto.stock,
  availability: availabilityOf(dto.stock, dto.availabilityStatus),
});

/** Reviewer e-mail is deliberately dropped. */
const toReview = ({ rating, comment, date, reviewerName }: ReviewDto): Review => ({
  rating,
  comment,
  date,
  reviewerName,
});

export const toProduct = (dto: ProductDto): Product => ({
  ...toProductSummary(dto),
  description: dto.description,
  images: dto.images.length > 0 ? dto.images : [dto.thumbnail],
  tags: dto.tags,
  sku: dto.sku,
  weight: dto.weight,
  dimensions: dto.dimensions,
  warrantyInformation: dto.warrantyInformation,
  shippingInformation: dto.shippingInformation,
  returnPolicy: dto.returnPolicy,
  minimumOrderQuantity: dto.minimumOrderQuantity,
  reviews: dto.reviews.map(toReview),
});

export const toProductsPage = (dto: ProductListDto): Page<ProductSummary> => ({
  items: dto.products.map(toProductSummary),
  total: dto.total,
  skip: dto.skip,
  limit: dto.limit,
});
