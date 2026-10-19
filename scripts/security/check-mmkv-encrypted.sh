#!/usr/bin/env bash
# SEC-03: verify that the persisted query cache (MMKV) is encrypted at rest.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: check-mmkv-encrypted.sh [options]

Copies the app's MMKV file out of a connected Android emulator/device (debug build,
via `run-as`) and fails if it is missing, empty, or contains readable plaintext.

Options:
  -s, --serial SERIAL   adb device serial            (env: ANDROID_SERIAL)
  -p, --package ID      application id               (env: APP_ID, default: com.zobaer53.productexplorer)
  -i, --id MMKV_ID      MMKV instance id             (env: MMKV_ID, default: product-explorer.cache)
  -f, --file PATH       check a local file instead of pulling from a device
  -k, --keep            keep the pulled copy and print its path
  -h, --help            show this help

Plaintext markers (env MARKERS, space separated) default to:
  "title" dummyjson products @x.dummyjson.com reviewerName

Run the app first and let it load at least one page so the cache has been written.
EOF
}

APP_ID="${APP_ID:-com.zobaer53.productexplorer}"
MMKV_ID="${MMKV_ID:-product-explorer.cache}"
MARKERS="${MARKERS:-\"title\" dummyjson products @x.dummyjson.com reviewerName}"
LOCAL_FILE=""
KEEP=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s | --serial) export ANDROID_SERIAL="$2"; shift 2 ;;
    -p | --package) APP_ID="$2"; shift 2 ;;
    -i | --id) MMKV_ID="$2"; shift 2 ;;
    -f | --file) LOCAL_FILE="$2"; shift 2 ;;
    -k | --keep) KEEP=1; shift ;;
    -h | --help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

fail() { echo "FAIL: $*" >&2; exit 1; }

if [[ -z "$LOCAL_FILE" ]]; then
  sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
  adb="adb"
  [[ -n "$sdk" && -x "$sdk/platform-tools/adb" ]] && adb="$sdk/platform-tools/adb"
  command -v "$adb" >/dev/null || fail "adb not found (set ANDROID_HOME or add adb to PATH)"

  remote="files/mmkv/$MMKV_ID"
  if ! "$adb" shell run-as "$APP_ID" ls "$remote" >/dev/null 2>&1; then
    echo "MMKV file '$remote' not found for $APP_ID. Contents of files/mmkv/:" >&2
    "$adb" shell run-as "$APP_ID" ls -la files/mmkv/ >&2 || true
    fail "no MMKV file with id '$MMKV_ID' (is a debug build installed and has it cached data?)"
  fi

  LOCAL_FILE="$(mktemp "${TMPDIR:-/tmp}/mmkv-$MMKV_ID.XXXXXX")"
  [[ "$KEEP" -eq 1 ]] || trap 'rm -f "$LOCAL_FILE"' EXIT
  "$adb" exec-out run-as "$APP_ID" cat "$remote" >"$LOCAL_FILE"
  echo "Pulled $APP_ID:$remote"
fi

[[ -f "$LOCAL_FILE" ]] || fail "file not found: $LOCAL_FILE"
[[ -s "$LOCAL_FILE" ]] || fail "MMKV file is empty: $LOCAL_FILE"
echo "Size: $(wc -c <"$LOCAL_FILE" | tr -d ' ') bytes"

found=0
for marker in $MARKERS; do
  if LC_ALL=C strings -a -n 4 "$LOCAL_FILE" | grep -F -q -- "$marker"; then
    echo "  plaintext marker found: $marker" >&2
    found=1
  fi
done
[[ "$found" -eq 0 ]] || fail "MMKV file contains readable plaintext; the cache is not encrypted"

[[ "$KEEP" -eq 1 ]] && echo "Kept copy: $LOCAL_FILE"
echo "PASS: MMKV '$MMKV_ID' is non-empty and contains no plaintext markers"
