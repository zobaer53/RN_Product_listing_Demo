// https://docs.expo.dev/guides/using-eslint/
const fs = require('node:fs');
const path = require('node:path');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const testingLibrary = require('eslint-plugin-testing-library');
const globals = require('globals');

const featuresDir = path.join(__dirname, 'src/features');
const features = fs.existsSync(featuresDir)
  ? fs
      .readdirSync(featuresDir)
      .filter((name) => fs.statSync(path.join(featuresDir, name)).isDirectory())
  : [];

/**
 * Architecture boundaries (feature-first + clean architecture).
 * Generated per feature so new features get the same rules automatically.
 */
const featureZones = features.flatMap((feature) => {
  const root = `./src/features/${feature}`;
  return [
    {
      target: `${root}/domain`,
      from: './src',
      except: [`./features/${feature}/domain`, './core/errors'],
      message: 'domain must stay pure: only its own domain and @core/errors.',
    },
    {
      target: `${root}/data`,
      from: [`${root}/presentation`, './src/shared', './src/app'],
      message: 'data must not depend on presentation, shared UI or routes.',
    },
    {
      target: `${root}/presentation`,
      from: `${root}/data`,
      message: 'presentation talks to use cases via the feature module, never to data directly.',
    },
    {
      target: root,
      from: './src/features',
      except: [`./${feature}`],
      message: 'features must not import other features.',
    },
    {
      target: './src/app',
      from: root,
      except: ['./index.ts'],
      message: 'routes may only import a feature through its public index.ts.',
    },
  ];
});

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*', 'coverage/*', '.claude/*', 'docs/*'],
  },
  {
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            ...featureZones,
            {
              target: './src/shared',
              from: ['./src/features', './src/app'],
              message: 'shared must stay feature-agnostic.',
            },
            {
              target: './src/core',
              from: ['./src/features', './src/shared', './src/app'],
              message: 'core is infrastructure and must not depend on UI or features.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@react-native-async-storage/async-storage',
              message: 'Plaintext storage is not allowed. Use @core/storage (encrypted MMKV).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/domain/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-native', 'react-native-*', 'expo*', '@tanstack/*', 'zod'],
              message: 'domain must be framework-free TypeScript.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '*.config.js',
      'tests/setup/*.js',
      'plugins/**/*.js',
      'e2e/**/*.{js,mjs}',
      'scripts/**/*.{js,mjs}',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx'],
    ...testingLibrary.configs['flat/react'],
  },
]);
