import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../testing/render-with-providers';
import { SectionHeader } from './SectionHeader';
import { Wordmark } from './Wordmark';

describe('headers', () => {
  it('[SH-08] Wordmark reads as the app name', async () => {
    await renderWithProviders(<Wordmark />);
    expect(screen.getByRole('header', { name: 'Product Explorer' })).toBeOnTheScreen();
    expect(screen.getByText('Product')).toBeOnTheScreen();
    expect(screen.getByText('Explorer')).toBeOnTheScreen();
  });

  it('[SH-08] SectionHeader shows title and caption', async () => {
    await renderWithProviders(<SectionHeader title="Products" caption="Showing 10 of 194" />);
    expect(screen.getByRole('header', { name: 'Products' })).toBeOnTheScreen();
    expect(screen.getByText('Showing 10 of 194')).toBeOnTheScreen();
  });

  it('[SH-08] SectionHeader caption is optional', async () => {
    await renderWithProviders(<SectionHeader title="Reviews" />);
    expect(screen.getByRole('header', { name: 'Reviews' })).toBeOnTheScreen();
  });
});
