#!/usr/bin/env bash
# Put a raw screen recording inside a device frame with a platform caption.
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: frame-video.sh <in.mp4> <ios|android> <out.mp4> [--device-name NAME] [--trim-start S]

Scales the recording, places it in a rendered device frame (rounded screen corners,
iPhone Dynamic Island or Pixel punch-hole camera, side buttons) on a neutral
background, and adds a caption bar such as "[Android] Google Pixel 6a".
--trim-start drops the first S seconds (e.g. idle time while the test driver starts).
Output: H.264 (yuv420p, +faststart), no audio.

Environment:
  SCREEN_WIDTH  rendered screen width in px (default: 540)
  BACKGROUND    canvas colour (default: #EEF1F5)
  FPS           output frame rate (default: 30)
  CRF           x264 quality, higher = smaller (default: 28)
  PRESET        x264 preset (default: slow)
EOF
}

case "${1:-}" in -h | --help) usage; exit 0 ;; esac
[[ $# -ge 3 ]] || { usage >&2; exit 2; }
input="$1" platform="$2" out="$3"
shift 3
device_name=""
trim_start=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --device-name) device_name="$2"; shift 2 ;;
    --trim-start) trim_start="$2"; shift 2 ;;
    *) usage >&2; exit 2 ;;
  esac
done

case "$platform" in
  ios) device_name="${device_name:-iPhone 17 Pro Simulator}" radius_pct=135 ;;
  android) device_name="${device_name:-Google Pixel 6a}" radius_pct=95 ;;
  *) die "platform must be ios or android" ;;
esac

require ffmpeg ffprobe swift
[[ -f "$input" ]] || die "input not found: $input"

SCREEN_WIDTH="$(even "${SCREEN_WIDTH:-540}")"
BACKGROUND="${BACKGROUND:-#EEF1F5}"
FPS="${FPS:-30}"
CRF="${CRF:-28}"
PRESET="${PRESET:-slow}"

# Layout (px): caption on top, device centred below with even margins.
read -r src_w src_h _ <<<"$(probe_video "$input")"
sw="$SCREEN_WIDTH"
sh="$(even $((sw * src_h / src_w)))"
bezel=$((sw * 4 / 100))
radius=$((sw * radius_pct / 1000))
margin=56
caption_h=120
canvas_w="$(even $((sw + 2 * bezel + 2 * margin)))"
canvas_h="$(even $((caption_h + sh + 2 * bezel + margin)))"
sx=$(((canvas_w - sw) / 2))
sy=$((caption_h + bezel))

work="$(mktemp -d "${TMPDIR:-/tmp}/frame-video.XXXXXX")"
trap 'rm -rf "$work"' EXIT

swift "$MEDIA_DIR/render-device.swift" --platform "$platform" --canvas "${canvas_w}x${canvas_h}" \
  --screen "$sx,$sy,$sw,$sh" --radius "$radius" --bezel "$bezel" --background "$BACKGROUND" \
  --out "$work/frame.png"
swift "$MEDIA_DIR/render-caption.swift" --platform "$platform" --text "$device_name" \
  --width "$canvas_w" --height "$caption_h" --out "$work/caption.png"

log "Framing $input -> $out (${canvas_w}x${canvas_h}, screen ${sw}x${sh})"
mkdir -p "$(dirname "$out")"
ffmpeg -v error -stats -y -ss "$trim_start" -i "$input" -i "$work/frame.png" -i "$work/caption.png" -filter_complex "\
[0:v]fps=$FPS:eof_action=pass,scale=$sw:$sh:flags=lanczos,setsar=1,\
pad=$canvas_w:$canvas_h:$sx:$sy:color=black[screen];\
[screen][1:v]overlay=0:0[framed];\
[framed][2:v]overlay=0:0,format=yuv420p[out]" \
  -map "[out]" -an -c:v libx264 -preset "$PRESET" -crf "$CRF" -movflags +faststart "$out"

log "Saved $out ($(du -h "$out" | cut -f1 | tr -d ' '))"
