#!/usr/bin/env bash
# Combine the framed Android and iOS videos into one side-by-side video.
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: side-by-side.sh <android.mp4> <ios.mp4> <out.mp4>

Stacks two framed videos horizontally (Android left, iOS right). The shorter one is
padded at the bottom to the same height and holds its last frame until the longer
one ends.

Environment:
  BACKGROUND  padding colour, should match frame-video.sh (default: #EEF1F5)
  CRF         x264 quality (default: 28)
  PRESET      x264 preset (default: slow)
EOF
}

case "${1:-}" in -h | --help) usage; exit 0 ;; esac
[[ $# -eq 3 ]] || { usage >&2; exit 2; }
left="$1" right="$2" out="$3"
require ffmpeg ffprobe
[[ -f "$left" ]] || die "not found: $left"
[[ -f "$right" ]] || die "not found: $right"

BACKGROUND="${BACKGROUND:-#EEF1F5}"
CRF="${CRF:-28}"
PRESET="${PRESET:-slow}"

read -r _ lh ld <<<"$(probe_video "$left")"
read -r _ rh rd <<<"$(probe_video "$right")"
height=$((lh > rh ? lh : rh))
# Seconds the shorter clip must hold its last frame (awk: bash has no floats).
lpad="$(awk -v a="$ld" -v b="$rd" 'BEGIN { d = b - a; print (d > 0 ? d : 0) }')"
rpad="$(awk -v a="$ld" -v b="$rd" 'BEGIN { d = a - b; print (d > 0 ? d : 0) }')"
color="0x${BACKGROUND#\#}"

log "Side by side -> $out"
mkdir -p "$(dirname "$out")"
ffmpeg -v error -stats -y -i "$left" -i "$right" -filter_complex "\
[0:v]pad=iw:$height:0:0:color=$color,tpad=stop_mode=clone:stop_duration=$lpad,setsar=1[l];\
[1:v]pad=iw:$height:0:0:color=$color,tpad=stop_mode=clone:stop_duration=$rpad,setsar=1[r];\
[l][r]hstack=inputs=2,format=yuv420p[out]" \
  -map "[out]" -an -c:v libx264 -preset "$PRESET" -crf "$CRF" -movflags +faststart "$out"

log "Saved $out ($(du -h "$out" | cut -f1 | tr -d ' '))"
