import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import withAndroidDebugSigning, { transformAppBuildGradle } from './with-android-debug-signing';

// android/app/build.gradle exactly as `expo prebuild` generates it for SDK 58.
const fixture = readFileSync(join(__dirname, '__fixtures__', 'app.build.gradle'), 'utf8');

const debugSigningBlock = (gradle: string) => {
  const match = /signingConfigs\s*\{\s*debug\s*\{([\s\S]*?)\n\s*\}/.exec(gradle);
  if (!match?.[1]) throw new Error('debug signing config not found');
  return match[1];
};

const reactBlock = (gradle: string) => {
  const start = gradle.indexOf('react {');
  const end = gradle.indexOf('autolinkLibrariesWithApp()', start);
  return gradle.slice(start, end);
};

describe('with-android-debug-signing', () => {
  it('[CI-01] reads the debug keystore from the environment with the default as fallback', () => {
    const block = debugSigningBlock(transformAppBuildGradle(fixture));
    expect(block).toContain("System.getenv('ANDROID_DEBUG_KEYSTORE_PATH')");
    expect(block).toContain("file('debug.keystore')");
    expect(block).toContain("System.getenv('ANDROID_DEBUG_KEYSTORE_PASSWORD') ?: 'android'");
    expect(block).toContain("System.getenv('ANDROID_DEBUG_KEY_ALIAS') ?: 'androiddebugkey'");
    expect(block).toContain("System.getenv('ANDROID_DEBUG_KEY_PASSWORD') ?: 'android'");
    expect(block).not.toMatch(/storePassword 'android'\n/);
  });

  it('[CI-01] leaves the release signing config untouched', () => {
    const output = transformAppBuildGradle(fixture);
    const release = (gradle: string) => gradle.slice(gradle.indexOf('buildTypes {'));
    expect(release(output)).toBe(release(fixture));
  });

  it('[CI-02] embeds the JS bundle in debug builds only when EMBED_JS_BUNDLE=1', () => {
    const block = reactBlock(transformAppBuildGradle(fixture));
    expect(block).toMatch(
      /if \(System\.getenv\('EMBED_JS_BUNDLE'\) == '1'\) \{\s*debuggableVariants = \[\]\s*\}/,
    );
  });

  it('[CI-02] is idempotent', () => {
    const once = transformAppBuildGradle(fixture);
    expect(transformAppBuildGradle(once)).toBe(once);
  });

  it('[CI-02] fails loudly when the template changed', () => {
    expect(() => transformAppBuildGradle('android {}')).toThrow(/with-android-debug-signing/);
  });

  it('[CI-02] is an Expo config plugin', () => {
    expect(typeof withAndroidDebugSigning).toBe('function');
    const config = withAndroidDebugSigning({ name: 'app', slug: 'app' });
    expect(config.name).toBe('app');
  });
});
