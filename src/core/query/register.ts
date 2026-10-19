import type { AppError } from '@core/errors/app-error';

/** Every query/mutation error is an AppError (repositories reject with AppError only). */
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}
