// jest-expo installs a stub `fetch`; restore Node's primitives (captured in
// tests/setup/jest-environment.js) so MSW can intercept real requests.
const primitives = (globalThis as unknown as { __nodeFetchPrimitives: Record<string, unknown> })
  .__nodeFetchPrimitives;

for (const [name, value] of Object.entries(primitives)) {
  Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
}
