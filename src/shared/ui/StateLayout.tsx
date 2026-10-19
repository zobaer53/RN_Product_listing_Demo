import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MAX_FONT_SCALE, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { StateIllustration, type StateIllustrationVariant } from './skia/StateIllustration';

export interface StateLayoutProps {
  illustration: StateIllustrationVariant;
  title: string;
  message?: string;
  /** Usually one or two `ActionButton`s. */
  actions?: ReactNode;
  testID?: string;
}

/** Centered illustration, title, message and actions shared by all full-screen states. */
export function StateLayout({ illustration, title, message, actions, testID }: StateLayoutProps) {
  return (
    <View style={styles.container} testID={testID}>
      <StateIllustration variant={illustration} />
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {title}
      </Text>
      {message ? (
        <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {message}
        </Text>
      ) : null}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  title: { ...typography.sectionTitle, fontSize: 18, lineHeight: 24, textAlign: 'center' },
  message: { ...typography.body, color: typography.caption.color, textAlign: 'center' },
  actions: { marginTop: spacing.sm, flexDirection: 'row', gap: spacing.md },
});
