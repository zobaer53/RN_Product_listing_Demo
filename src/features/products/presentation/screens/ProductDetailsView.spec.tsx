import { screen, userEvent, within } from '@testing-library/react-native';

import { AppError } from '@core/errors/app-error';
import { renderWithProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';
import { makeProduct, makeProductSummary } from '@tests/fixtures/product-entities';

import { ProductDetailsView } from './ProductDetailsView';
import type { ProductDetailsViewProps } from './view-contracts';

const makeProps = (overrides: Partial<ProductDetailsViewProps> = {}): ProductDetailsViewProps => ({
  product: undefined,
  isPlaceholder: false,
  status: 'pending',
  error: null,
  isOnline: true,
  isInvalidId: false,
  onRetry: jest.fn(),
  onBack: jest.fn(),
  ...overrides,
});

const loaded = (overrides: Partial<ProductDetailsViewProps> = {}) =>
  makeProps({ product: makeProduct(), status: 'success', ...overrides });

describe('ProductDetailsView', () => {
  it('[DET-01] shows the skeleton while pending without a product', async () => {
    await renderWithProviders(<ProductDetailsView {...makeProps()} />);
    expect(screen.getByTestId(TestIds.productDetails)).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.stateLoading)).toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.detailsTitle)).not.toBeOnTheScreen();
  });

  it('[DET-02] renders the cached summary and a skeleton for the rest', async () => {
    await renderWithProviders(
      <ProductDetailsView {...makeProps({ product: makeProductSummary(), isPlaceholder: true })} />,
    );
    expect(screen.getByTestId(TestIds.detailsTitle)).toHaveTextContent(
      'Essence Mascara Lash Princess',
    );
    expect(within(screen.getByTestId(TestIds.detailsPrice)).getByText('$9.99')).toBeOnTheScreen();
    expect(
      screen.getByRole('image', { name: 'Essence Mascara Lash Princess, image 1 of 1' }),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.detailsSkeleton)).toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.detailsDescription)).not.toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.detailsSpecs)).not.toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.detailsReviews)).not.toBeOnTheScreen();
  });

  it('[DET-02] keeps the summary and explains why details are missing', async () => {
    const summary = { product: makeProductSummary(), isPlaceholder: true };
    await renderWithProviders(
      <ProductDetailsView
        {...makeProps({ ...summary, status: 'error', error: new AppError('timeout') })}
      />,
    );
    expect(screen.getByTestId(TestIds.detailsTitle)).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.stateError)).toBeOnTheScreen();

    await renderWithProviders(
      <ProductDetailsView {...makeProps({ ...summary, isOnline: false })} />,
    );
    expect(screen.getByTestId(TestIds.detailsTitle)).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.stateOffline)).toBeOnTheScreen();
  });

  it('[DET-03] shows not found for a 404 and goes back', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductDetailsView
        {...makeProps({
          status: 'error',
          error: new AppError('http', 'missing', { status: 404 }),
          onBack,
        })}
      />,
    );
    expect(screen.getByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
    await user.press(screen.getByTestId(TestIds.stateNotFoundBack));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('[DET-04] shows not found for an invalid id', async () => {
    await renderWithProviders(<ProductDetailsView {...makeProps({ isInvalidId: true })} />);
    expect(screen.getByTestId(TestIds.stateNotFound)).toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.stateLoading)).not.toBeOnTheScreen();
  });

  it('[DET-05] lists reviewer names and comments but never an e-mail', async () => {
    const product = makeProduct();
    const reviews = product.reviews.map((review) => ({
      ...review,
      reviewerEmail: 'someone@x.dummyjson.com',
    }));
    await renderWithProviders(
      <ProductDetailsView {...loaded({ product: { ...product, reviews } })} />,
    );
    const list = screen.getByTestId(TestIds.detailsReviews);
    expect(within(list).getByText('Eleanor Collins')).toBeOnTheScreen();
    expect(within(list).getByText('Lucas Gordon')).toBeOnTheScreen();
    expect(within(list).getByText('Would not recommend!')).toBeOnTheScreen();
    expect(screen.queryByText(/@/)).not.toBeOnTheScreen();
    expect(screen.queryByLabelText(/@/)).not.toBeOnTheScreen();
  });

  it('[DET-06] shows price, struck original price and discount', async () => {
    await renderWithProviders(
      <ProductDetailsView
        {...loaded({ product: makeProduct({ price: 100, discountPercentage: 20 }) })}
      />,
    );
    const price = screen.getByTestId(TestIds.detailsPrice);
    expect(within(price).getByText('$100.00')).toBeOnTheScreen();
    expect(within(price).getByText('$125.00')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(within(price).getByText('−20%')).toBeOnTheScreen();
  });

  it('[DET-07] shows the error state and retries', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductDetailsView
        {...makeProps({ status: 'error', error: new AppError('network'), onRetry })}
      />,
    );
    expect(screen.getByTestId(TestIds.stateError)).toBeOnTheScreen();
    await user.press(screen.getByTestId(TestIds.stateErrorRetry));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('[DET-08] shows the offline state without a cached product', async () => {
    await renderWithProviders(<ProductDetailsView {...makeProps({ isOnline: false })} />);
    expect(screen.getByTestId(TestIds.stateOffline)).toBeOnTheScreen();
  });

  it('[DET-09] renders every section of a full product', async () => {
    await renderWithProviders(<ProductDetailsView {...loaded()} />);
    expect(screen.getByTestId(TestIds.detailsCarousel)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Essence Mascara Lash Princess' })).toHaveProp(
      'testID',
      TestIds.detailsTitle,
    );
    expect(screen.getByText('Essence')).toBeOnTheScreen();
    expect(screen.getByText('beauty')).toBeOnTheScreen();
    expect(screen.getByTestId(TestIds.detailsRating)).toHaveTextContent(/2\.6 · 2 reviews/);
    expect(screen.getByTestId(TestIds.detailsAvailability)).toHaveTextContent('In stock');
    expect(screen.getByTestId(TestIds.detailsDescription)).toHaveTextContent(
      /popular mascara known for its volumizing/,
    );
    expect(screen.getByTestId(TestIds.detailsSpecs)).toBeOnTheScreen();
    expect(screen.queryByTestId(TestIds.detailsSkeleton)).not.toBeOnTheScreen();
  });

  it('[DET-10] has an accessible back button', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ProductDetailsView {...loaded({ onBack })} />);
    const back = screen.getByRole('button', { name: 'Go back' });
    expect(back).toHaveProp('testID', TestIds.detailsBack);
    await user.press(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
