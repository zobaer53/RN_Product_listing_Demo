/**
 * Single error model for the whole app. Everything that can fail (network, parsing,
 * validation) is normalised into an AppError so the UI can switch on `kind`.
 */
export type AppErrorKind =
  'offline' | 'timeout' | 'network' | 'http' | 'parse' | 'validation' | 'cancelled' | 'unknown';

export interface AppErrorOptions {
  status?: number;
  issues?: string[];
  cause?: unknown;
}

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number | undefined;
  readonly issues: string[];

  constructor(kind: AppErrorKind, message?: string, options: AppErrorOptions = {}) {
    super(message ?? kind, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.kind = kind;
    this.status = options.status;
    this.issues = options.issues ?? [];
  }

  get isNotFound(): boolean {
    return this.kind === 'http' && this.status === 404;
  }

  get isServerError(): boolean {
    return this.kind === 'http' && this.status !== undefined && this.status >= 500;
  }
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;
