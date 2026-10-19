import { http, HttpResponse } from 'msw';

import { createHttpClient } from '@core/network/http-client';
import page1 from '@tests/fixtures/products-page-1.json';
import { API_BASE_URL } from '@tests/msw/handlers';
import { server } from '@tests/msw/server';

import { PRODUCT_LIST_FIELDS } from '../dto/product.dto';
import { createProductRemoteDataSource } from './product-remote.datasource';

const dataSource = createProductRemoteDataSource(
  createHttpClient({ baseUrl: API_BASE_URL, timeoutMs: 1_000 }),
);

describe('product remote data source', () => {
  it('[DATA-06] requests a page with limit, skip and the list field selection', async () => {
    const urls: URL[] = [];
    server.use(
      http.get(`${API_BASE_URL}/products`, ({ request }) => {
        urls.push(new URL(request.url));
        return HttpResponse.json({ ...page1, skip: 20 });
      }),
    );

    const dto = await dataSource.fetchProductsPage({ limit: 10, skip: 20 });

    expect(dto.skip).toBe(20);
    expect(urls).toHaveLength(1);
    const [url] = urls;
    expect(url?.pathname).toBe('/products');
    expect(url?.searchParams.get('limit')).toBe('10');
    expect(url?.searchParams.get('skip')).toBe('20');
    expect(url?.searchParams.get('select')).toBe(PRODUCT_LIST_FIELDS);
    expect(url?.search).toContain('limit=10&skip=20&select=');
  });

  it('[DATA-06] requests product details by id', async () => {
    const dto = await dataSource.fetchProductById(1);

    expect(dto.id).toBe(1);
    expect(dto.title).toBe('Essence Mascara Lash Princess');
  });
});
