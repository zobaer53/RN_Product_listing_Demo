import type { AppError } from '@core/errors/app-error';

import { TestIds } from '../testing/test-ids';
import { ActionButton } from './ActionButton';
import { StateLayout } from './StateLayout';

export interface ErrorCopy {
  title: string;
  message: string;
}

export const OFFLINE_COPY: ErrorCopy = {
  title: "You're offline",
  message: 'Connect to the internet to load products.',
};

/** User-facing copy for an error, chosen by its kind. */
export const errorCopy = (error: AppError | null): ErrorCopy => {
  switch (error?.kind) {
    case 'offline':
      return OFFLINE_COPY;
    case 'timeout':
      return {
        title: 'This is taking too long',
        message: 'The server took too long to respond. Please try again.',
      };
    case 'network':
      return {
        title: "Can't reach the server",
        message: 'Check your connection and try again.',
      };
    case 'parse':
    case 'validation':
      return {
        title: 'We received unexpected data',
        message: 'Please try again later.',
      };
    default:
      return error?.isServerError
        ? {
            title: 'Something went wrong on our side',
            message: 'Our server had a problem. Please try again in a moment.',
          }
        : { title: 'Something went wrong', message: 'Please try again.' };
  }
};

export interface ErrorStateProps {
  error: AppError | null;
  onRetry: () => void;
}

/** Full-screen error with copy per error kind and a Retry action. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { title, message } = errorCopy(error);
  return (
    <StateLayout
      testID={TestIds.stateError}
      illustration={error?.kind === 'offline' ? 'offline' : 'error'}
      title={title}
      message={message}
      actions={<ActionButton label="Retry" onPress={onRetry} testID={TestIds.stateErrorRetry} />}
    />
  );
}
