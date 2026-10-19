#!/usr/bin/env bash
# Record an Android device screen while a demo command runs.
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: record-android.sh <out.mp4> [--serial SERIAL] [--size WxH] [--bit-rate BPS] [-- command ...]

Records with `adb shell screenrecord`. screenrecord stops after at most 3 minutes, so
the recording is taken in segments (default 170 s each) that are pulled and joined
with ffmpeg; expect a few dropped frames at each segment boundary. If a command is
given after `--` (e.g. `maestro test .maestro/showcase/showcase.yaml`), recording stops
when it finishes; otherwise press Enter to stop.

Physical devices record at native resolution (a Pixel 6a gives 1080x2400). Emulators
with large screens may fall back to a letterboxed 720x1280; pass e.g. --size 720x1606.

Environment:
  ANDROID_SERIAL   adb serial (default: first connected physical device)
  SIZE             capture size, e.g. 1080x2400 (default: native resolution)
  BIT_RATE         bits per second (default: 8000000)
  SEGMENT_SECONDS  segment length, at most 180 (default: 170)
EOF
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
  "") usage >&2; exit 2 ;;
esac
out="$1"
shift
SIZE="${SIZE:-}"
BIT_RATE="${BIT_RATE:-8000000}"
SEGMENT_SECONDS="${SEGMENT_SECONDS:-170}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --serial) ANDROID_SERIAL="$2"; shift 2 ;;
    --size) SIZE="$2"; shift 2 ;;
    --bit-rate) BIT_RATE="$2"; shift 2 ;;
    --) shift; break ;;
    *) usage >&2; exit 2 ;;
  esac
done

require ffmpeg ffprobe
adb="$(adb_bin)"
serial="$(android_serial)"
remote_dir="/sdcard/product-explorer-recording"
work="$(mktemp -d "${TMPDIR:-/tmp}/record-android.XXXXXX")"
mkdir -p "$(dirname "$out")"

sr_args=(--bit-rate "$BIT_RATE" --time-limit "$SEGMENT_SECONDS")
[[ -n "$SIZE" ]] && sr_args+=(--size "$SIZE")

"$adb" -s "$serial" shell rm -rf "$remote_dir"
"$adb" -s "$serial" shell mkdir -p "$remote_dir"

# Record consecutive segments until the stop flag appears.
(
  i=0
  while [[ ! -e "$work/stop" ]]; do
    i=$((i + 1))
    "$adb" -s "$serial" shell screenrecord "${sr_args[@]}" "$remote_dir/part-$(printf '%03d' "$i").mp4" || true
  done
) &
loop=$!

stop() {
  touch "$work/stop"
  "$adb" -s "$serial" shell pkill -2 screenrecord >/dev/null 2>&1 || true
  wait "$loop" 2>/dev/null || true
}
cleanup() {
  stop
  "$adb" -s "$serial" shell rm -rf "$remote_dir" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

started=$SECONDS
sleep 2 # let screenrecord start before the demo begins
run_or_wait "$@"
sleep 1
stop
elapsed=$((SECONDS - started))
sleep 1 # screenrecord finalises the MP4 after SIGINT

# Pull the segments and join them (skipping any that are empty or unreadable).
: >"$work/list.txt"
while IFS= read -r part; do
  "$adb" -s "$serial" pull "$remote_dir/$part" "$work/$part" </dev/null >/dev/null 2>&1 ||
    die "could not pull $remote_dir/$part"
  if ffprobe -v error "$work/$part" </dev/null >/dev/null 2>&1; then
    echo "file '$work/$part'" >>"$work/list.txt"
  fi
done < <("$adb" -s "$serial" shell ls "$remote_dir" | tr -d '\r' | sort)
[[ -s "$work/list.txt" ]] || die "no usable recording segments were captured"

log "Joining $(wc -l <"$work/list.txt" | tr -d ' ') segment(s)"
ffmpeg -v error -y -f concat -safe 0 -i "$work/list.txt" -map 0:v:0 -c copy "$work/joined.mp4"

# screenrecord only writes a frame when the screen changes, so a static ending would be
# lost. Convert to constant frame rate and hold the last frame until recording stopped.
ffmpeg -v error -y -i "$work/joined.mp4" -map 0:v:0 \
  -vf "fps=30:eof_action=pass,tpad=stop_mode=clone:stop_duration=$elapsed" -t "$elapsed" \
  -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p "$out"
log "Saved $out ($(probe_video "$out"))"
