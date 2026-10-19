import { z } from 'zod';

import { AppError } from './app-error';
import { toAppError } from './to-app-error';

const abortError = (name: string) => Object.assign(new Error('aborted'), { name });

describe('toAppError', () => {
  it('[CORE-ERR-01] passes AppError through untouched', () => {
    const original = new AppError('http', 'Not found', { status: 404 });
    expect(toAppError(original)).toBe(original);
  });

  it('[CORE-ERR-02] maps fetch failures, timeouts and aborts to transport kinds', () => {
    expect(toAppError(new TypeError('Network request failed')).kind).toBe('network');
    expect(toAppError(new TypeError('fetch failed')).kind).toBe('network');
    expect(toAppError(abortError('TimeoutError')).kind).toBe('timeout');
    expect(toAppError(abortError('AbortError')).kind).toBe('cancelled');
    expect(toAppError(new SyntaxError('Unexpected token <')).kind).toBe('parse');
    expect(toAppError('boom').kind).toBe('unknown');
    expect(toAppError(new Error('boom'))).toMatchObject({ kind: 'unknown', message: 'boom' });
  });

  it('[CORE-ERR-03] maps ZodError to parse with dotted issue paths', () => {
    const schema = z.object({ products: z.array(z.object({ id: z.number() })) });
    const result = schema.safeParse({ products: [{ id: 1 }, { id: 'x' }] });
    if (result.success) throw new Error('expected failure');

    const error = toAppError(result.error);

    expect(error.kind).toBe('parse');
    expect(error.issues).toHaveLength(1);
    expect(error.issues[0]).toMatch(/^products\.1\.id: /);
    expect(error.cause).toBe(result.error);
  });
});
