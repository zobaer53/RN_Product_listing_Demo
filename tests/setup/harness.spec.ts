import { http, HttpResponse } from 'msw';

import { server } from '../msw/server';

describe('test harness', () => {
  it('intercepts fetch with MSW fixtures', async () => {
    const response = await fetch('https://dummyjson.com/products?limit=10&skip=0');
    const body = (await response.json()) as { products: unknown[]; total: number };
    expect(body.products).toHaveLength(10);
    expect(body.total).toBe(194);
  });

  it('supports per-test overrides', async () => {
    server.use(http.get('https://dummyjson.com/products/:id', () => HttpResponse.json({}, { status: 500 })));
    const response = await fetch('https://dummyjson.com/products/1');
    expect(response.status).toBe(500);
  });
});
