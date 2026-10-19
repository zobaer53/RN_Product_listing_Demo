import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { MAX_FONT_SCALE, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

export interface SectionHeaderProps {
  title: string;
  caption?: string;
  style?: StyleProp<ViewStyle>;
}

/** Section title with an optional trailing caption. */
export function SectionHeader({ title, caption, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {caption ? (
        <Text style={styles.caption} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: typography.sectionTitle,
  // Fills the space after the title, so a changing count never wraps onto a clipped line.
  caption: { ...typography.caption, flex: 1, textAlign: 'right' },
});
