#!/usr/bin/env bash
# Record, frame and package the README showcase videos for Android and iOS.
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: make-showcase.sh [all|android|ios] [--skip-record]

For each platform: clean status bar -> record while the demo flow runs -> device frame
+ caption -> GIF preview. With both platforms it also renders a side-by-side cut.
The app must already be installed on the Android device and the iOS simulator.
Android records a physical device. While it records, `adb reverse tcp:4010 tcp:4010`
lets the app reach the host's mock API at http://localhost:4010.

  --skip-record   reuse the raw recordings in $WORK_DIR (re-frame only)

Outputs ($OUT_DIR, default docs/media):
  showcase-android.mp4  showcase-ios.mp4  showcase-side-by-side.mp4
  showcase-android.gif  showcase-ios.gif

Environment:
  ANDROID_SERIAL        adb serial (default: first connected physical device)
  IOS_UDID              simulator UDID (default: first booted simulator)
  ANDROID_DEVICE_NAME   caption (default: read from the device, e.g. Google Pixel 6a)
  MOCK_API_PORT         port forwarded with adb reverse (default: 4010; ADB_REVERSE=0 skips it)
  IOS_DEVICE_NAME       caption (default: iPhone 17 Pro Simulator)
  SHOWCASE_FLOW         Maestro flow (default: .maestro/showcase/showcase.yaml)
  DEMO_CMD              custom demo command run with `bash -c` (DEVICE_ID is exported);
                        "manual" records until you press Enter
  ANDROID_TRIM_START    seconds cut from the start of the Android recording (default: 0)
  IOS_TRIM_START        seconds cut from the start of the iOS recording (default: 0)
  WORK_DIR              raw recordings (default: $TMPDIR/product-explorer-showcase)
  OUT_DIR               output directory (default: docs/media)
  GIF_WIDTH, GIF_FPS    GIF preview size and rate (default: 320, 12)
EOF
}

platforms=(android ios)
record=1
for arg in "$@"; do
  case "$arg" in
    all) platforms=(android ios) ;;
    android | ios) platforms=("$arg") ;;
    --skip-record) record=0 ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

SHOWCASE_FLOW="${SHOWCASE_FLOW:-.maestro/showcase/showcase.yaml}"
WORK_DIR="${WORK_DIR:-${TMPDIR:-/tmp}/product-explorer-showcase}"
OUT_DIR="${OUT_DIR:-docs/media}"
port="${MOCK_API_PORT:-4010}"
mkdir -p "$WORK_DIR" "$OUT_DIR"

# The command that drives the demo on one device, as an array in "demo".
demo_for() {
  local device="$1"
  export DEVICE_ID="$device"
  if [[ "${DEMO_CMD:-}" == "manual" ]]; then
    demo=()
  elif [[ -n "${DEMO_CMD:-}" ]]; then
    demo=(bash -c "$DEMO_CMD")
  else
    require maestro
    [[ -f "$SHOWCASE_FLOW" ]] || die "flow not found: $SHOWCASE_FLOW"
    demo=(maestro --device "$device" test "$SHOWCASE_FLOW")
  fi
}

record_platform() {
  local platform="$1" raw="$WORK_DIR/raw-$1.mp4" device flag status=0
  if [[ "$platform" == "android" ]]; then
    device="$(android_serial)" flag="--serial"
  else
    device="$(ios_udid)" flag="--udid"
  fi
  demo_for "$device"
  "$MEDIA_DIR/prepare-devices.sh" "$platform" "$flag" "$device"
  if [[ "$platform" == "android" ]]; then
    android_device_name "$device" >"$WORK_DIR/raw-android.name"
    [[ "${ADB_REVERSE:-1}" == "0" ]] || "$(adb_bin)" -s "$device" reverse "tcp:$port" "tcp:$port" >/dev/null
  fi

  "$MEDIA_DIR/record-$platform.sh" "$raw" "$flag" "$device" -- ${demo[@]+"${demo[@]}"} || status=$?

  "$MEDIA_DIR/prepare-devices.sh" "$platform" "$flag" "$device" --exit || true
  if [[ "$platform" == "android" && "${ADB_REVERSE:-1}" != "0" ]]; then
    "$(adb_bin)" -s "$device" reverse --remove "tcp:$port" >/dev/null 2>&1 || true
  fi
  return "$status"
}

for platform in "${platforms[@]}"; do
  raw="$WORK_DIR/raw-$platform.mp4"
  if [[ "$record" -eq 1 ]]; then
    log "Recording $platform"
    record_platform "$platform"
  fi
  [[ -f "$raw" ]] || die "no raw recording at $raw (run without --skip-record)"

  if [[ "$platform" == "android" ]]; then
    detected="$(cat "$WORK_DIR/raw-android.name" 2>/dev/null || true)"
    name="${ANDROID_DEVICE_NAME:-${detected:-Google Pixel 6a}}" trim="${ANDROID_TRIM_START:-0}"
  else
    name="${IOS_DEVICE_NAME:-iPhone 17 Pro Simulator}" trim="${IOS_TRIM_START:-0}"
  fi
  "$MEDIA_DIR/frame-video.sh" "$raw" "$platform" "$OUT_DIR/showcase-$platform.mp4" \
    --device-name "$name" --trim-start "$trim"
  "$MEDIA_DIR/to-gif.sh" "$OUT_DIR/showcase-$platform.mp4" "$OUT_DIR/showcase-$platform.gif" \
    --width "${GIF_WIDTH:-320}" --fps "${GIF_FPS:-12}"
done

if [[ -f "$OUT_DIR/showcase-android.mp4" && -f "$OUT_DIR/showcase-ios.mp4" ]]; then
  "$MEDIA_DIR/side-by-side.sh" "$OUT_DIR/showcase-android.mp4" "$OUT_DIR/showcase-ios.mp4" \
    "$OUT_DIR/showcase-side-by-side.mp4"
fi

log "Done:"
ls -lh "$OUT_DIR"/showcase-* >&2
