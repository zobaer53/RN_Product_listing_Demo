import { Canvas, Circle, Group, Line, Path, RoundedRect, vec } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { colors } from '../../theme/tokens';

export type StateIllustrationVariant = 'empty' | 'offline' | 'error' | 'notFound';

const SIZE = 120;
const CENTER = SIZE / 2;

const drawings: Record<StateIllustrationVariant, { background: string; art: ReactNode }> = {
  empty: {
    background: colors.primaryContainer,
    art: (
      <Group>
        <Path
          path="M30 52 L60 40 L90 52 L60 64 Z"
          color={colors.onPrimaryContainer}
          opacity={0.35}
        />
        <RoundedRect x={30} y={52} width={60} height={36} r={6} color={colors.brandTeal} />
        <Path path="M30 52 L18 64 L48 74 L60 64 Z" color={colors.primary} />
        <Path path="M90 52 L102 64 L72 74 L60 64 Z" color={colors.primary} />
        <Circle cx={36} cy={32} r={4} color={colors.brandOrange} />
        <Circle cx={88} cy={28} r={3} color={colors.brandOrange} />
      </Group>
    ),
  },
  offline: {
    background: colors.surfaceMuted,
    art: (
      <Group>
        <Circle cx={46} cy={64} r={16} color={colors.white} />
        <Circle cx={64} cy={54} r={20} color={colors.white} />
        <Circle cx={80} cy={66} r={14} color={colors.white} />
        <RoundedRect x={30} y={62} width={64} height={20} r={10} color={colors.white} />
        <Line
          p1={vec(34, 34)}
          p2={vec(88, 92)}
          color={colors.discount}
          style="stroke"
          strokeWidth={6}
          strokeCap="round"
        />
      </Group>
    ),
  },
  error: {
    background: colors.dangerContainer,
    art: (
      <Group>
        <Circle cx={CENTER} cy={CENTER} r={28} color={colors.brandOrange} />
        <RoundedRect x={56} y={42} width={8} height={24} r={4} color={colors.white} />
        <Circle cx={CENTER} cy={76} r={5} color={colors.white} />
      </Group>
    ),
  },
  notFound: {
    background: colors.primaryContainer,
    art: (
      <Group>
        <Circle cx={54} cy={54} r={22} color={colors.white} />
        <Circle cx={54} cy={54} r={22} color={colors.brandTeal} style="stroke" strokeWidth={7} />
        <Line
          p1={vec(71, 71)}
          p2={vec(90, 90)}
          color={colors.brandTeal}
          style="stroke"
          strokeWidth={9}
          strokeCap="round"
        />
        <Circle cx={54} cy={54} r={4} color={colors.brandOrange} />
      </Group>
    ),
  },
};

export interface StateIllustrationProps {
  variant: StateIllustrationVariant;
  testID?: string;
}

/** Decorative vector art for empty, offline, error and not-found states. */
export function StateIllustration({ variant, testID }: StateIllustrationProps) {
  const { background, art } = drawings[variant];
  return (
    <Canvas
      style={{ width: SIZE, height: SIZE }}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Circle cx={CENTER} cy={CENTER} r={CENTER - 4} color={background} />
      {art}
    </Canvas>
  );
}
