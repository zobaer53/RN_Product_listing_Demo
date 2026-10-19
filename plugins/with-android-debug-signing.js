'use strict';

const { withAppBuildGradle } = require('expo/config-plugins');

const PLUGIN = 'with-android-debug-signing';
const MARKER = `// @generated ${PLUGIN}`;

const DEBUG_SIGNING_PATTERN = /(signingConfigs\s*\{\s*debug\s*\{)([\s\S]*?)(\n(\s*)\})/;
const REACT_BLOCK_PATTERN = /(\nreact\s*\{\n)/;

/**
 * Lets CI sign debug APKs with a shared keystore. Every value comes from the environment
 * at Gradle time, so local builds keep using the default `debug.keystore`.
 */
const applyDebugSigning = (gradle) => {
  if (gradle.includes(`${MARKER}: signing`)) return gradle;
  if (!DEBUG_SIGNING_PATTERN.test(gradle)) {
    throw new Error(`[${PLUGIN}] signingConfigs.debug block not found in app/build.gradle`);
  }
  return gradle.replace(DEBUG_SIGNING_PATTERN, (_match, open, _body, close, indent) => {
    const pad = `${indent}    `;
    const body = [
      `${MARKER}: signing`,
      `def debugKeystorePath = System.getenv('ANDROID_DEBUG_KEYSTORE_PATH')`,
      `storeFile debugKeystorePath ? file(debugKeystorePath) : file('debug.keystore')`,
      `storePassword System.getenv('ANDROID_DEBUG_KEYSTORE_PASSWORD') ?: 'android'`,
      `keyAlias System.getenv('ANDROID_DEBUG_KEY_ALIAS') ?: 'androiddebugkey'`,
      `keyPassword System.getenv('ANDROID_DEBUG_KEY_PASSWORD') ?: 'android'`,
    ]
      .map((line) => `\n${pad}${line}`)
      .join('');
    return `${open}${body}${close}`;
  });
};

/**
 * With EMBED_JS_BUNDLE=1 no variant counts as debuggable, so the React Native Gradle
 * plugin bundles the JS into the debug APK and it runs without Metro.
 */
const applyEmbedBundle = (gradle) => {
  if (gradle.includes(`${MARKER}: embed bundle`)) return gradle;
  if (!REACT_BLOCK_PATTERN.test(gradle)) {
    throw new Error(`[${PLUGIN}] react { } block not found in app/build.gradle`);
  }
  const snippet = [
    `    ${MARKER}: embed bundle`,
    `    if (System.getenv('EMBED_JS_BUNDLE') == '1') {`,
    '        debuggableVariants = []',
    '    }',
    '',
  ].join('\n');
  return gradle.replace(REACT_BLOCK_PATTERN, `$1${snippet}`);
};

/** Pure transform of `android/app/build.gradle` (Groovy), exported for tests. */
const transformAppBuildGradle = (gradle) => applyEmbedBundle(applyDebugSigning(gradle));

const withAndroidDebugSigning = (config) =>
  withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language !== 'groovy') {
      throw new Error(`[${PLUGIN}] only Groovy build.gradle files are supported`);
    }
    modConfig.modResults.contents = transformAppBuildGradle(modConfig.modResults.contents);
    return modConfig;
  });

module.exports = withAndroidDebugSigning;
module.exports.default = withAndroidDebugSigning;
module.exports.transformAppBuildGradle = transformAppBuildGradle;
