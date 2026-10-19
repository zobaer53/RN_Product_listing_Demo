/**
 * Lightweight stand-in for @shopify/react-native-skia under Jest.
 *
 * The official mock needs CanvasKit (WASM) loaded into the test environment. Unit tests
 * only assert props, accessibility and behaviour, never pixels, so `Canvas` becomes a
 * plain View (keeping testID and accessibility props) and drawing primitives render
 * their children only.
 */
import { createElement, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';

interface Point {
  x: number;
  y: number;
}

const primitive = (name: string) => {
  const Primitive = ({ children }: { children?: ReactNode }) =>
    createElement(Fragment, null, children);
  Primitive.displayName = `Skia.${name}`;
  return Primitive;
};

const primitives = [
  'Group',
  'Path',
  'Rect',
  'RoundedRect',
  'Circle',
  'Oval',
  'Line',
  'Fill',
  'LinearGradient',
  'RadialGradient',
  'Paint',
  'Mask',
] as const;

export const skiaMock: Record<string, unknown> = Object.fromEntries(
  primitives.map((name) => [name, primitive(name)]),
);

skiaMock.Canvas = View;
skiaMock.vec = (x = 0, y?: number): Point => ({ x, y: y ?? x });
skiaMock.rect = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});
