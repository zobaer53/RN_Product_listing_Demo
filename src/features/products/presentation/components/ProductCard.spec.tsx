import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@shared/testing/render-with-providers';
import { TestIds } from '@shared/testing/test-ids';
import { makeProductSummary } from '@tests/fixtures/product-entities';

import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('[PC-01] shows title, price, rating and discount', async () => {
    await renderWithProviders(<ProductCard product={makeProductSummary()} onPress={jest.fn()} />);
    expect(screen.getByText('Essence Mascara Lash Princess')).toBeOnTheScreen();
    expect(screen.getByText('$9.99')).toBeOnTheScreen();
    expect(screen.getByText('2.6')).toBeOnTheScreen();
    expect(screen.getByText('10% OFF')).toBeOnTheScreen();
  });

  it('[PC-01] is one accessible button with a descriptive label', async () => {
    await renderWithProviders(<ProductCard product={makeProductSummary()} onPress={jest.fn()} />);
    const card = screen.getByRole('button', {
      name: 'Essence Mascara Lash Princess, $9.99, rated 2.6 out of 5',
    });
    expect(card).toHaveProp('testID', TestIds.productCard(1));
  });

  it('[PC-01] reports its id on press and press-in', async () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <ProductCard
        product={makeProductSummary({ id: 7 })}
        onPress={onPress}
        onPressIn={onPressIn}
      />,
    );
    await user.press(screen.getByTestId(TestIds.productCard(7)));
    expect(onPressIn).toHaveBeenCalledWith(7);
    expect(onPress).toHaveBeenCalledWith(7);
  });

  it('[PC-01] hides the ribbon without a discount', async () => {
    await renderWithProviders(
      <ProductCard product={makeProductSummary({ discountPercentage: 0 })} onPress={jest.fn()} />,
    );
    expect(screen.queryByText(/OFF/)).not.toBeOnTheScreen();
  });
});
