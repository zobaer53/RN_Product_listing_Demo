/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: '<rootDir>/tests/setup/jest-environment.js',
  // Resolve the web implementations of Reanimated and Worklets (official Jest setup).
  resolver: 'react-native-reanimated/jest/resolver',
  transform: {
    // msw v3 ships some dependencies as .mjs only
    '^.+\\.mjs$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/restore-fetch.ts',
    '<rootDir>/tests/setup/jest.setup.ts',
    '<rootDir>/tests/setup/native-mocks.ts',
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts?(x)',
    '<rootDir>/tests/**/*.spec.ts?(x)',
    '<rootDir>/plugins/**/*.spec.ts',
  ],
  // Only crawl source folders (keeps local tooling and hidden folders out of the haste map).
  roots: ['<rootDir>/src', '<rootDir>/tests', '<rootDir>/plugins'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/.*|react-native-paper|react-native-mmkv|react-native-nitro-modules|msw|@mswjs/.*|@msw/.*|until-async|rettime|outvariant|is-node-process|headers-polyfill|cookie|@open-draft/.*|strict-event-emitter|@tanstack/.*).+(?<!\\.mjs)$',
  ],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.ts',
    '!src/app/**',
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 75, functions: 80, lines: 80 },
    './src/features/products/domain/': { statements: 90, branches: 90, functions: 90, lines: 90 },
  },
};
