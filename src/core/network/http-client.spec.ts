import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';

import { AppError } from '@core/errors/app-error';
import { server } from '@tests/msw/server';

import { createHttpClient, isAllowedBaseUrl } from './http-client';

const BASE_URL = 'https://dummyjson.com';
const client = createHttpClient({ baseUrl: BASE_URL, timeoutMs: 1_000 });
const itemSchema = z.object({ id: z.number(), title: z.string() });

const rejectionOf = async (promise: Promise<unknown>): Promise<AppError> => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof AppError) return error;
    throw new Error(`expected AppError, got ${String(error)}`);
  }
  throw new Error('expected the request to fail');
};

describe('createHttpClient', () => {
  it('[CORE-HTTP-01] resolves 200 responses validated by the schema, with encoded query params', async () => {
    let requestedUrl = '';
    server.use(
      http.get(`${BASE_URL}/items/:id`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ id: 7, title: 'Seven', extra: true });
      }),
    );

    const item = await client.get('/items/7', {
      schema: itemSchema,
      query: { q: 'a b', limit: 10, skip: undefined },
    });

    expect(item).toEqual({ id: 7, title: 'Seven' });
    expect(requestedUrl).toBe(`${BASE_URL}/items/7?q=a%20b&limit=10`);
  });

  it.each([404, 500])(
    '[CORE-HTTP-02] maps HTTP %i to an http AppError with status',
    async (status) => {
      server.use(http.get(`${BASE_URL}/items/1`, () => HttpResponse.json({}, { status })));

      const error = await rejectionOf(client.get('/items/1', { schema: itemSchema }));

      expect(error.kind).toBe('http');
      expect(error.status).toBe(status);
    },
  );

  it('[CORE-HTTP-03] rejects with timeout when the response is slower than the deadline', async () => {
    server.use(
      http.get(`${BASE_URL}/slow`, async () => {
        await delay(500);
        return HttpResponse.json({});
      }),
    );
    const impatient = createHttpClient({ baseUrl: BASE_URL, timeoutMs: 20 });

    const error = await rejectionOf(impatient.get('/slow'));

    expect(error.kind).toBe('timeout');
  });

  it('[CORE-HTTP-04] rejects with cancelled when the caller aborts', async () => {
    server.use(
      http.get(`${BASE_URL}/slow`, async () => {
        await delay(500);
        return HttpResponse.json({});
      }),
    );
    const controller = new AbortController();

    const pending = client.get('/slow', { signal: controller.signal });
    controller.abort();
    const error = await rejectionOf(pending);

    expect(error.kind).toBe('cancelled');

    const alreadyAborted = await rejectionOf(client.get('/slow', { signal: controller.signal }));
    expect(alreadyAborted.kind).toBe('cancelled');
  });

  it('[CORE-HTTP-05] rejects with parse for malformed JSON or schema mismatches', async () => {
    server.use(
      http.get(`${BASE_URL}/broken`, () => HttpResponse.text('{"id": 1,', { status: 200 })),
      http.get(`${BASE_URL}/items/1`, () => HttpResponse.json({ id: '1' })),
    );

    const malformed = await rejectionOf(client.get('/broken'));
    const mismatch = await rejectionOf(client.get('/items/1', { schema: itemSchema }));

    expect(malformed.kind).toBe('parse');
    expect(mismatch.kind).toBe('parse');
    expect(mismatch.issues.join()).toContain('id');
  });

  it('[CORE-HTTP-06] maps transport failures to network and only allows HTTPS outside dev', async () => {
    const failing = createHttpClient({
      baseUrl: BASE_URL,
      timeoutMs: 1_000,
      fetchFn: () => Promise.reject(new TypeError('Network request failed')),
    });

    expect((await rejectionOf(failing.get('/items/1'))).kind).toBe('network');
    expect(isAllowedBaseUrl('https://dummyjson.com', false)).toBe(true);
    expect(isAllowedBaseUrl('http://api.example.com', false)).toBe(false);
    expect(isAllowedBaseUrl('http://api.example.com', true)).toBe(true);
    // The local mock API (emulator / simulator loopback) stays reachable from E2E builds.
    expect(isAllowedBaseUrl('http://10.0.2.2:4010', false)).toBe(true);
    expect(isAllowedBaseUrl('http://localhost:4010', false)).toBe(true);
    expect(() =>
      createHttpClient({ baseUrl: 'http://api.example.com', timeoutMs: 1, allowInsecure: false }),
    ).toThrow(/HTTPS/);
  });
});
