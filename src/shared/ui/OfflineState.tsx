import { TestIds } from '../testing/test-ids';
import { ActionButton } from './ActionButton';
import { OFFLINE_COPY } from './ErrorState';
import { StateLayout } from './StateLayout';

export interface OfflineStateProps {
  onRetry: () => void;
}

/** Full-screen state shown when there is no connection and nothing cached to display. */
export function OfflineState({ onRetry }: OfflineStateProps) {
  return (
    <StateLayout
      testID={TestIds.stateOffline}
      illustration="offline"
      title={OFFLINE_COPY.title}
      message={OFFLINE_COPY.message}
      actions={
        <ActionButton
          label="Try again"
          mode="outlined"
          onPress={onRetry}
          testID={TestIds.stateOfflineRetry}
        />
      }
    />
  );
}
