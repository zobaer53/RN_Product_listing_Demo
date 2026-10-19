import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useNow } from '../hooks/use-now';
import { TestIds } from '../testing/test-ids';
import { colors, MAX_FONT_SCALE, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { formatRelativeTime } from '../utils/format';

export interface OfflineBannerProps {
  /** Epoch ms of the data on screen; 0 when unknown. */
  dataUpdatedAt: number;
  /** Current time, injectable for tests. */
  now?: number;
}

/** Inline notice that the app is offline and showing cached data. */
export function OfflineBanner({ dataUpdatedAt, now }: OfflineBannerProps) {
  const currentTime = useNow();
  const freshness =
    dataUpdatedAt > 0
      ? `showing data from ${formatRelativeTime(dataUpdatedAt, now ?? currentTime)}`
      : 'showing saved data';
  const message = `You're offline · ${freshness}`;

  return (
    <View
      style={styles.banner}
      testID={TestIds.offlineBanner}
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <MaterialCommunityIcons name="wifi-off" size={16} color={colors.warning} />
      <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.warningContainer,
  },
  text: { ...typography.caption, flex: 1, color: colors.warning },
});
