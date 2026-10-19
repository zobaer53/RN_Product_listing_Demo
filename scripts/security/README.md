# Security checks

Small, dependency-free scripts that verify the security properties described in the project README.

| Script                    | Spec   | What it asserts                                                                                      |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `check-mmkv-encrypted.sh` | SEC-03 | The persisted query cache (MMKV) on a device exists, is non-empty and contains no readable plaintext |
| `check-manifest.sh`       | SEC-04 | The Android manifest sets `android:allowBackup="false"`                                              |

## `check-mmkv-encrypted.sh`

Needs a **debug** build installed on a connected emulator or device (it uses `adb shell run-as`), and the app must have loaded data at least once so the cache file exists.

```sh
# Defaults: package com.zobaer53.productexplorer, MMKV id product-explorer.cache
scripts/security/check-mmkv-encrypted.sh

# Pick a device, another MMKV id, or keep the pulled copy for inspection
scripts/security/check-mmkv-encrypted.sh --serial emulator-5554 --id product-explorer.cache --keep

# Check a file you already have
scripts/security/check-mmkv-encrypted.sh --file ./product-explorer.cache
```

How it works:

1. Copies `files/mmkv/<id>` out of the app sandbox with `adb exec-out run-as <package> cat …`. If the file is missing it lists `files/mmkv/` so you can spot the right id.
2. Fails if the file is empty.
3. Runs `strings` over the file and fails if any plaintext marker is found: `"title"`, `dummyjson`, `products`, `@x.dummyjson.com`, `reviewerName`. Override with `MARKERS="a b c"`.

With AES-256 enabled, MMKV encrypts keys and values, so none of these markers should survive. A plaintext cache fails loudly with exit code 1.

`adb` is taken from `$ANDROID_HOME/platform-tools` (or `$ANDROID_SDK_ROOT`), falling back to `adb` on `PATH`.

## `check-manifest.sh`

```sh
npx expo prebuild -p android          # or after ./gradlew assembleDebug
scripts/security/check-manifest.sh    # merged manifests, else android/app/src/main/AndroidManifest.xml
scripts/security/check-manifest.sh path/to/AndroidManifest.xml
```

Without arguments it checks every merged manifest under `android/app/build/intermediates/merged_manifest*/` (all build variants). If the app has not been built yet it falls back to the prebuilt `android/app/src/main/AndroidManifest.xml`. Set `ANDROID_DIR` if the native project lives elsewhere. It exits non-zero if any manifest is missing `android:allowBackup="false"`, so CI can run it right after the Gradle build.
