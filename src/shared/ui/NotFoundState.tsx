import { TestIds } from '../testing/test-ids';
import { ActionButton } from './ActionButton';
import { StateLayout } from './StateLayout';

export interface NotFoundStateProps {
  onBack: () => void;
  title?: string;
  message?: string;
  backLabel?: string;
}

/** Full-screen state for a resource that does not exist (404 or invalid link). */
export function NotFoundState({
  onBack,
  title = "We couldn't find that",
  message = 'It may have been removed, or the link is incorrect.',
  backLabel = 'Go back',
}: NotFoundStateProps) {
  return (
    <StateLayout
      testID={TestIds.stateNotFound}
      illustration="notFound"
      title={title}
      message={message}
      actions={
        <ActionButton label={backLabel} onPress={onBack} testID={TestIds.stateNotFoundBack} />
      }
    />
  );
}
