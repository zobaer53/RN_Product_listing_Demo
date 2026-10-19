#!/usr/bin/env bash
# Record the iOS simulator screen while a demo command runs.
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: record-ios.sh <out.mp4> [--udid UDID] [-- command ...]

Records the simulator with `xcrun simctl io recordVideo` (H.264). If a command is
given after `--` (e.g. `maestro test .maestro/showcase/showcase.yaml`), recording stops
when it finishes; otherwise press Enter to stop.

Environment:
  IOS_UDID   simulator UDID (default: first booted simulator)
EOF
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
  "") usage >&2; exit 2 ;;
esac
out="$1"
shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --udid) IOS_UDID="$2"; shift 2 ;;
    --) shift; break ;;
    *) usage >&2; exit 2 ;;
  esac
done

require xcrun ffmpeg ffprobe
udid="$(ios_udid)"
mkdir -p "$(dirname "$out")"
work="$(mktemp -d "${TMPDIR:-/tmp}/record-ios.XXXXXX")"
raw="$work/raw.mp4"

xcrun simctl io "$udid" recordVideo --codec h264 --force "$raw" &
recorder=$!
started=$SECONDS
stop() {
  if kill -0 "$recorder" 2>/dev/null; then
    kill -INT "$recorder"
    wait "$recorder" || true
  fi
}
trap 'stop; rm -rf "$work"' EXIT
sleep 2 # recordVideo needs a moment before the first frame is captured

run_or_wait "$@"
sleep 1
stop
elapsed=$((SECONDS - started))
[[ -s "$raw" ]] || die "recording failed: nothing was captured"

# simctl only writes a frame when the screen changes, so a static ending would be lost.
# Convert to constant frame rate and hold the last frame until recording actually stopped.
ffmpeg -v error -y -i "$raw" -map 0:v:0 \
  -vf "fps=30:eof_action=pass,tpad=stop_mode=clone:stop_duration=$elapsed" -t "$elapsed" \
  -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p "$out"
log "Saved $out ($(probe_video "$out"))"
