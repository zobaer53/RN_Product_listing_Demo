import { http, HttpResponse } from 'msw';

import page0 from '../fixtures/products-page-0.json';
import page1 from '../fixtures/products-page-1.json';
import pageLast from '../fixtures/products-page-last.json';
import product1 from '../fixtures/product-1.json';

export const API_BASE_URL = 'https://dummyjson.com';

const pagesBySkip: Record<number, unknown> = { 0: page0, 10: page1, 190: pageLast };

/** Default happy-path handlers backed by real API fixtures. Override per test with server.use(). */
export const handlers = [
  http.get(`${API_BASE_URL}/products`, ({ request }) => {
    const skip = Number(new URL(request.url).searchParams.get('skip') ?? 0);
    const page = pagesBySkip[skip];
    return page
      ? HttpResponse.json(page)
      : HttpResponse.json({ products: [], total: 194, skip, limit: 10 });
  }),
  http.get(`${API_BASE_URL}/products/:id`, ({ params }) => {
    if (params.id === '1') return HttpResponse.json(product1);
    return HttpResponse.json(
      { message: `Product with id '${String(params.id)}' not found` },
      { status: 404 },
    );
  }),
];
