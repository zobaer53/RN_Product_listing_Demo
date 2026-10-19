import { ZodError } from 'zod';

import { AppError } from './app-error';

const errorName = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string'
    ? error.name
    : undefined;

const formatIssues = (error: ZodError): string[] =>
  error.issues.map((issue) => {
    const path = issue.path.map(String).join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });

/**
 * Normalises anything thrown into an AppError.
 * `TimeoutError` is the abort reason used for deadlines (see the HTTP client); any other
 * abort is treated as a cancellation by the caller.
 */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) {
    return new AppError('parse', 'Unexpected response format', {
      issues: formatIssues(error),
      cause: error,
    });
  }

  const name = errorName(error);
  if (name === 'TimeoutError') {
    return new AppError('timeout', 'Request timed out', { cause: error });
  }
  if (name === 'AbortError') {
    return new AppError('cancelled', 'Request cancelled', { cause: error });
  }
  if (error instanceof SyntaxError) {
    return new AppError('parse', 'Malformed response', { cause: error });
  }
  if (error instanceof TypeError) {
    return new AppError('network', 'Network request failed', { cause: error });
  }

  const message = error instanceof Error ? error.message : undefined;
  return new AppError('unknown', message, { cause: error });
};
