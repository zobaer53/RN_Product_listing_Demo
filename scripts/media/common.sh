# Shared helpers for the showcase media scripts. Source it; do not run it.
# shellcheck shell=bash

MEDIA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export MEDIA_DIR

die() {
  echo "error: $*" >&2
  exit 1
}

log() { echo "==> $*" >&2; }

require() {
  local tool
  for tool in "$@"; do
    command -v "$tool" >/dev/null || die "'$tool' is required but not on PATH"
  done
}

# adb from ANDROID_HOME / ANDROID_SDK_ROOT, falling back to PATH.
adb_bin() {
  local sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
  if [[ -n "$sdk" && -x "$sdk/platform-tools/adb" ]]; then
    echo "$sdk/platform-tools/adb"
  else
    require adb
    echo adb
  fi
}

# Target Android device: $ANDROID_SERIAL, else the first connected physical device
# (emulators are only used when named explicitly).
android_serial() {
  if [[ -n "${ANDROID_SERIAL:-}" ]]; then
    echo "$ANDROID_SERIAL"
    return
  fi
  local serial
  serial="$("$(adb_bin)" devices | awk 'NR > 1 && $2 == "device" && $1 !~ /^emulator-/ { print $1; exit }')"
  [[ -n "$serial" ]] || die "no physical Android device connected (connect one or set ANDROID_SERIAL)"
  echo "$serial"
}

# Marketing name of an Android device, e.g. "Google Pixel 6a".
android_device_name() {
  local adb maker model
  adb="$(adb_bin)"
  maker="$("$adb" -s "$1" shell getprop ro.product.manufacturer | tr -d '\r')"
  model="$("$adb" -s "$1" shell getprop ro.product.model | tr -d '\r')"
  # Capitalise the manufacturer ("samsung" -> "Samsung") and avoid "Google Google ...".
  maker="$(echo "${maker:0:1}" | tr '[:lower:]' '[:upper:]')${maker:1}"
  case "$model" in "$maker"*) echo "$model" ;; *) echo "$maker $model" ;; esac
}

# Target iOS simulator: $IOS_UDID, else the first booted simulator.
ios_udid() {
  if [[ -n "${IOS_UDID:-}" ]]; then
    echo "$IOS_UDID"
    return
  fi
  local udid
  udid="$(xcrun simctl list devices booted | grep -Eo '[0-9A-F]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12}' | head -n 1 || true)"
  [[ -n "$udid" ]] || die "no booted iOS simulator (boot one or set IOS_UDID)"
  echo "$udid"
}

# Probe a media file: probe_video FILE -> "width height duration"
probe_video() {
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$1" | tr '\n' ' '
}

# Round to the nearest even integer (H.264 with yuv420p needs even dimensions).
even() { echo $(((($1) + 1) / 2 * 2)); }

# Run "$@" while a recorder runs in the background; without a command, wait for Enter.
# The recorder is stopped by the caller (after this returns) so the file can finalise.
run_or_wait() {
  if [[ $# -gt 0 ]]; then
    log "Running: $*"
    "$@" || echo "warning: demo command exited with status $?" >&2
  else
    read -r -p "Recording... press Enter to stop. " _
  fi
}
