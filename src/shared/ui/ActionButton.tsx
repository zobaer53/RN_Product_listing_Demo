import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';

import { FontFamily } from '../theme/fonts';
import { MAX_FONT_SCALE, radius, sizes } from '../theme/tokens';

export interface ActionButtonProps {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  icon?: string;
  testID?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

// Extends the 36pt visual height to a 44pt touch target.
const HIT_SLOP = (sizes.minTouchTarget - sizes.buttonHeight) / 2;

/** Design system button: 36pt high, radius 12, Lato Bold label. */
export function ActionButton({
  label,
  onPress,
  mode = 'contained',
  icon,
  testID,
  accessibilityHint,
  style,
}: ActionButtonProps) {
  return (
    <Button
      mode={mode}
      icon={icon}
      onPress={onPress}
      testID={testID}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      compact
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radius.md },
  content: { height: sizes.buttonHeight, paddingHorizontal: 12 },
  label: { fontFamily: FontFamily.labelBold, fontSize: 14, lineHeight: 18, marginVertical: 0 },
});
