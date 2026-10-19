#!/usr/bin/env bash
# SEC-04: assert the Android manifest disables backups (android:allowBackup="false").
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: check-manifest.sh [AndroidManifest.xml ...]

Checks every given manifest. Without arguments it checks the merged manifests under
  $ANDROID_DIR/app/build/intermediates/merged_manifest*/
and falls back to the prebuilt $ANDROID_DIR/app/src/main/AndroidManifest.xml.

Environment:
  ANDROID_DIR   native Android project directory (default: android)
EOF
}

[[ "${1:-}" == "-h" || "${1:-}" == "--help" ]] && { usage; exit 0; }

ANDROID_DIR="${ANDROID_DIR:-android}"
manifests=("$@")

if [[ ${#manifests[@]} -eq 0 ]]; then
  intermediates="$ANDROID_DIR/app/build/intermediates"
  if [[ -d "$intermediates" ]]; then
    while IFS= read -r file; do
      manifests+=("$file")
    done < <(find "$intermediates" -path '*merged_manifest*' -name AndroidManifest.xml)
  fi
  if [[ ${#manifests[@]} -eq 0 && -f "$ANDROID_DIR/app/src/main/AndroidManifest.xml" ]]; then
    manifests+=("$ANDROID_DIR/app/src/main/AndroidManifest.xml")
  fi
fi

if [[ ${#manifests[@]} -eq 0 ]]; then
  echo "FAIL: no AndroidManifest.xml found (run 'npx expo prebuild -p android' first)" >&2
  exit 1
fi

status=0
for manifest in "${manifests[@]}"; do
  if grep -q 'android:allowBackup="false"' "$manifest" &&
    ! grep -q 'android:allowBackup="true"' "$manifest"; then
    echo "ok    $manifest"
  else
    echo "FAIL  $manifest: android:allowBackup is not \"false\"" >&2
    status=1
  fi
done

[[ "$status" -eq 0 ]] && echo "PASS: backups are disabled in ${#manifests[@]} manifest(s)"
exit "$status"
