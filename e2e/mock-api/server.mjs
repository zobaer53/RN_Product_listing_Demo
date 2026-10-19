// Deterministic stand-in for dummyjson.com used by the E2E flows. Plain Node (>= 22), no deps.
// Usage: `npm run mock-api` (see README.md next to this file).
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_API_PORT ?? 4010);
const HOST = '0.0.0.0';
const SLOW_DELAY_MS = 2_000;
const DEFAULT_LIMIT = 30;

const SCENARIOS = [
  'ok', // 194 products, like the real API
  'products-25', // 25 products: 3 pages, end of list reachable
  'empty', // no products
  'error-500', // every product endpoint answers 500
  'page2-error', // first page works, any skip > 0 answers 500
  'not-found', // details answer 404
  'network-down', // sockets are destroyed without a response
  'slow', // every product response is delayed by 2s
];

const readFixture = (name) =>
  JSON.parse(readFileSync(new URL(`../../tests/fixtures/${name}`, import.meta.url), 'utf8'));

const detailTemplate = readFixture('product-1.json');
const listTemplates = ['products-page-0.json', 'products-page-1.json', 'products-page-last.json']
  .map(readFixture)
  .flatMap((page) => page.products);

/** Full product (details shape) built from a real list item, with a new id. */
const buildProduct = (template, id) => {
  const { brand, ...item } = template;
  return {
    ...detailTemplate,
    ...item,
    ...(brand === undefined ? {} : { brand }),
    id,
    description: `${item.title}. A ${item.category} product served by the local mock API.`,
    tags: [item.category],
    sku: `MOCK-${String(id).padStart(4, '0')}`,
    images: [item.thumbnail],
  };
};

/** Cycles through the real list items; repeated items get a numbered title to stay distinct. */
const buildCatalogue = (size) =>
  Array.from({ length: size }, (_, index) => {
    const template = listTemplates[index % listTemplates.length];
    const round = Math.floor(index / listTemplates.length);
    const title = round === 0 ? template.title : `${template.title} #${round + 1}`;
    return buildProduct({ ...template, title }, index + 1);
  });

const FULL_CATALOGUE = buildCatalogue(194);
const catalogueFor = (scenario) => {
  if (scenario === 'empty') return [];
  if (scenario === 'products-25') return FULL_CATALOGUE.slice(0, 25);
  return FULL_CATALOGUE;
};

let scenario = SCENARIOS.includes(process.env.MOCK_API_SCENARIO)
  ? process.env.MOCK_API_SCENARIO
  : 'ok';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readJsonBody = async (req) => {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const toNonNegativeInt = (value, fallback) => {
  const number = Number(value);
  return value !== null && Number.isInteger(number) && number >= 0 ? number : fallback;
};

const pick = (product, fields) =>
  Object.fromEntries(
    ['id', ...fields].filter((key) => key in product).map((key) => [key, product[key]]),
  );

const listProducts = (res, url) => {
  const skip = toNonNegativeInt(url.searchParams.get('skip'), 0);
  if (scenario === 'page2-error' && skip > 0) {
    return sendJson(res, 500, { message: 'Internal server error' });
  }
  const limit = toNonNegativeInt(url.searchParams.get('limit'), DEFAULT_LIMIT);
  const select = url.searchParams.get('select');
  const catalogue = catalogueFor(scenario);
  const slice = catalogue.slice(skip, limit === 0 ? undefined : skip + limit);
  const products = select ? slice.map((product) => pick(product, select.split(','))) : slice;
  // Like dummyjson, `limit` echoes the number of items actually returned.
  return sendJson(res, 200, { products, total: catalogue.length, skip, limit: products.length });
};

const getProduct = (res, rawId) => {
  const product =
    scenario === 'not-found'
      ? undefined
      : catalogueFor(scenario).find((p) => String(p.id) === rawId);
  if (!product) return sendJson(res, 404, { message: `Product with id '${rawId}' not found` });
  return sendJson(res, 200, product);
};

const handleControl = async (req, res, url) => {
  if (url.pathname === '/__health') return sendJson(res, 200, { status: 'ok', scenario });
  if (req.method === 'GET') return sendJson(res, 200, { scenario });

  const body = await readJsonBody(req);
  const requested = body.scenario ?? body.name;
  if (!SCENARIOS.includes(requested)) {
    return sendJson(res, 400, { message: `Unknown scenario '${requested}'`, scenarios: SCENARIOS });
  }
  scenario = requested;
  return sendJson(res, 200, { scenario });
};

const handleProducts = async (req, res, url) => {
  if (scenario === 'network-down') return req.socket.destroy();
  if (scenario === 'slow') await sleep(SLOW_DELAY_MS);
  if (scenario === 'error-500') return sendJson(res, 500, { message: 'Internal server error' });

  if (url.pathname === '/products') return listProducts(res, url);
  const match = /^\/products\/([^/]+)$/.exec(url.pathname);
  if (match) return getProduct(res, decodeURIComponent(match[1]));
  return sendJson(res, 404, { message: `Route ${url.pathname} not found` });
};

const isControlRoute = (req, url) =>
  (url.pathname === '/__health' && req.method === 'GET') ||
  (url.pathname === '/__scenario' && (req.method === 'GET' || req.method === 'POST'));

const server = createServer(async (req, res) => {
  const startedAt = Date.now();
  const url = new URL(req.url ?? '/', 'http://localhost');
  const activeScenario = scenario;
  res.on('close', () => {
    const outcome = res.headersSent ? res.statusCode : 'dropped';
    const ms = Date.now() - startedAt;
    console.log(
      `[mock-api] ${req.method} ${url.pathname}${url.search} -> ${outcome} ${ms}ms (${activeScenario})`,
    );
  });

  try {
    if (isControlRoute(req, url)) return await handleControl(req, res, url);
    if (req.method === 'GET' && url.pathname.startsWith('/products')) {
      return await handleProducts(req, res, url);
    }
    return sendJson(res, 404, { message: `Route ${req.method} ${url.pathname} not found` });
  } catch (error) {
    console.error('[mock-api] handler failed', error);
    if (!res.headersSent) sendJson(res, 500, { message: 'Mock API failure' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[mock-api] listening on http://${HOST}:${PORT} (scenario: ${scenario})`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
  server.closeAllConnections();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
