import { screen, within } from '@testing-library/react-native';

import { renderWithProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';
import { makeProduct } from '@tests/fixtures/product-entities';

import { AvailabilityChip } from './AvailabilityChip';
import { ProductDetailsSkeleton } from './ProductDetailsSkeleton';
import { ProductImageCarousel } from './ProductImageCarousel';
import { ProductPriceBlock } from './ProductPriceBlock';
import { ProductRatingRow } from './ProductRatingRow';
import { ProductSpecs } from './ProductSpecs';
import { ReviewList } from './ReviewList';

const NOW = Date.parse('2025-05-05T09:41:02.053Z');

describe('ProductPriceBlock', () => {
  it('[PC-05] shows price, struck original price and discount badge', async () => {
    await renderWithProviders(<ProductPriceBlock price={100} discountPercentage={20} />);
    const block = screen.getByTestId(TestIds.detailsPrice);
    expect(within(block).getByText('$100.00')).toBeOnTheScreen();
    expect(within(block).getByText('$125.00')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(within(block).getByText('−20%')).toBeOnTheScreen();
    expect(block).toHaveAccessibleName('Price $100.00, was $125.00, 20% off');
  });

  it('[PC-05] shows only the price without a discount', async () => {
    await renderWithProviders(<ProductPriceBlock price={9.99} discountPercentage={0} />);
    expect(screen.getByText('$9.99')).toBeOnTheScreen();
    expect(screen.queryByText(/%/)).not.toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.detailsPrice)).toHaveAccessibleName('Price $9.99');
  });
});

describe('ProductRatingRow', () => {
  it('[PC-06] shows stars, rating and review count', async () => {
    await renderWithProviders(<ProductRatingRow rating={2.56} reviewCount={3} />);
    expect(screen.getByTestId(TestIds.detailsRating)).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Rated 2.6 out of 5' })).toBeOnTheScreen();
    expect(screen.getByText('2.6 · 3 reviews')).toBeOnTheScreen();
  });

  it('[PC-06] uses the singular and omits a missing count', async () => {
    await renderWithProviders(<ProductRatingRow rating={4} reviewCount={1} />);
    expect(screen.getByText('4.0 · 1 review')).toBeOnTheScreen();
    await renderWithProviders(<ProductRatingRow rating={4} />);
    expect(screen.getByText('4.0')).toBeOnTheScreen();
  });
});

describe('AvailabilityChip', () => {
  it.each([
    ['in_stock', 99, 'In stock'],
    ['low_stock', 3, 'Low stock · 3 left'],
    ['out_of_stock', 0, 'Out of stock'],
  ] as const)('[PC-07] labels %s', async (availability, stock, label) => {
    await renderWithProviders(<AvailabilityChip availability={availability} stock={stock} />);
    expect(screen.getByTestId(TestIds.detailsAvailability)).toHaveTextContent(label);
  });
});

describe('ProductSpecs', () => {
  it('[PC-08] lists the product specifications', async () => {
    await renderWithProviders(<ProductSpecs product={makeProduct()} />);
    const specs = screen.getByTestId(TestIds.detailsSpecs);
    for (const text of [
      'BEA-ESS-ESS-001',
      '4 kg',
      '15.14 × 13.08 × 22.99 cm',
      '1 week warranty',
      'Ships in 3-5 business days',
      'No return policy',
      '48 units',
    ]) {
      expect(within(specs).getByText(text)).toBeOnTheScreen();
    }
  });
});

describe('ReviewList', () => {
  it('[PC-09] shows reviewer, stars, relative date and comment', async () => {
    const { reviews } = makeProduct();
    await renderWithProviders(<ReviewList reviews={reviews} now={NOW} />);
    const list = screen.getByTestId(TestIds.detailsReviews);
    expect(within(list).getByText('Eleanor Collins')).toBeOnTheScreen();
    expect(within(list).getByText('Would not recommend!')).toBeOnTheScreen();
    expect(within(list).getAllByText('5 days ago')).toHaveLength(2);
    expect(within(list).getByRole('image', { name: 'Rated 3.0 out of 5' })).toBeOnTheScreen();
  });

  it('[PC-09] never renders an email address', async () => {
    const reviews = makeProduct().reviews.map((review) => ({
      ...review,
      reviewerEmail: 'eleanor.collins@x.dummyjson.com',
    }));
    await renderWithProviders(<ReviewList reviews={reviews} now={NOW} />);
    expect(screen.queryByText(/@/)).not.toBeOnTheScreen();
  });

  it('[PC-09] says when there are no reviews', async () => {
    await renderWithProviders(<ReviewList reviews={[]} now={NOW} />);
    expect(screen.getByText('No reviews yet')).toBeOnTheScreen();
  });
});

describe('ProductImageCarousel', () => {
  it('[PC-10] renders one labelled image per url with page dots', async () => {
    await renderWithProviders(
      <ProductImageCarousel title="Mascara" images={['https://a/1.png', 'https://a/2.png']} />,
    );
    expect(screen.getByTestId(TestIds.detailsCarousel)).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Mascara, image 1 of 2' })).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Mascara, image 2 of 2' })).toBeOnTheScreen();
  });

  it('[PC-10] works with a single image', async () => {
    await renderWithProviders(
      <ProductImageCarousel title="Mascara" images={['https://a/1.png']} />,
    );
    expect(screen.getByRole('image', { name: 'Mascara, image 1 of 1' })).toBeOnTheScreen();
  });
});

describe('ProductDetailsSkeleton', () => {
  it('[PC-11] renders the full skeleton as the loading state', async () => {
    await renderWithProviders(<ProductDetailsSkeleton />);
    expect(screen.getByTestId(TestIds.stateLoading)).toHaveAccessibleName('Loading product');
  });

  it('[PC-11] renders only the body skeleton below a known summary', async () => {
    await renderWithProviders(<ProductDetailsSkeleton variant="body" />);
    expect(screen.getByTestId(TestIds.detailsSkeleton)).toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.stateLoading)).not.toBeOnTheScreen();
  });
});
