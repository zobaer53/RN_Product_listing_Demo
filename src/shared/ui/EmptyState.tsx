import { TestIds } from '../testing/test-ids';
import { ActionButton } from './ActionButton';
import { StateLayout } from './StateLayout';

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Full-screen state for a successful load that returned nothing. */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <StateLayout
      testID={TestIds.stateEmpty}
      illustration="empty"
      title={title}
      message={message}
      actions={
        actionLabel && onAction ? (
          <ActionButton label={actionLabel} mode="outlined" onPress={onAction} />
        ) : null
      }
    />
  );
}
