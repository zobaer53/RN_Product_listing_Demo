import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import type { AppError } from '@core/errors/app-error';
import { TestIds } from '@shared/testing/test-ids';
import { colors, MAX_FONT_SCALE, spacing } from '@shared/theme/tokens';
import { typography } from '@shared/theme/typography';
import { ActionButton } from '@shared/ui/ActionButton';

export interface ListFooterProps {
  isFetchingNextPage: boolean;
  nextPageError: AppError | null;
  hasNextPage: boolean;
  isOnline: boolean;
  total: number | undefined;
  onRetry: () => void;
}

type Variant = 'loading' | 'offline' | 'error' | 'end' | 'none';

const variantOf = (props: ListFooterProps): Variant => {
  if (props.isFetchingNextPage) return 'loading';
  if (props.hasNextPage && !props.isOnline) return 'offline';
  if (props.nextPageError) return 'error';
  if (!props.hasNextPage) return 'end';
  return 'none';
};

/** Footer of the infinite list: loading, retry, offline or end-of-list message. */
export function ListFooter(props: ListFooterProps) {
  switch (variantOf(props)) {
    case 'loading':
      return (
        <View
          style={styles.row}
          testID={TestIds.listFooterLoading}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading more products"
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    case 'offline':
      return (
        <View style={styles.row} testID={TestIds.listFooterOffline}>
          <MaterialCommunityIcons name="wifi-off" size={16} color={colors.textSecondaryAA} />
          <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Connect to load more
          </Text>
        </View>
      );
    case 'error':
      return (
        <View style={styles.column} testID={TestIds.listFooterError}>
          <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {"Couldn't load more products."}
          </Text>
          <ActionButton
            label="Retry"
            mode="outlined"
            onPress={props.onRetry}
            testID={TestIds.listFooterRetry}
          />
        </View>
      );
    case 'end':
      return (
        <View style={styles.row} testID={TestIds.listFooterEnd}>
          <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {props.total === undefined
              ? "You've reached the end"
              : `You've seen all ${props.total} products`}
          </Text>
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  column: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  text: { ...typography.caption, textAlign: 'center' },
});
