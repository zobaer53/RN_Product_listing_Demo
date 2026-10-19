#!/usr/bin/env bash
# Make a small looping GIF preview of a video (two-pass palette for clean colours).
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: to-gif.sh <in.mp4> <out.gif> [--width 320] [--fps 12] [--colors 128] [--start S] [--duration S]

Aim for at most ~5 MB so the README loads quickly; lower --width, --fps or --colors,
or trim with --start/--duration, if the GIF is too large.
EOF
}

case "${1:-}" in -h | --help) usage; exit 0 ;; esac
[[ $# -ge 2 ]] || { usage >&2; exit 2; }
input="$1" out="$2"
shift 2
width=320 fps=12 colors=128 trim=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --width) width="$2"; shift 2 ;;
    --fps) fps="$2"; shift 2 ;;
    --colors) colors="$2"; shift 2 ;;
    --start) trim+=(-ss "$2"); shift 2 ;;
    --duration) trim+=(-t "$2"); shift 2 ;;
    *) usage >&2; exit 2 ;;
  esac
done

require ffmpeg
[[ -f "$input" ]] || die "not found: $input"
mkdir -p "$(dirname "$out")"

ffmpeg -v error -y ${trim[@]+"${trim[@]}"} -i "$input" -filter_complex "\
fps=$fps,scale=$width:-2:flags=lanczos,split[a][b];\
[a]palettegen=max_colors=$colors:stats_mode=diff[p];\
[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
  -loop 0 "$out"

size_kb=$(($(wc -c <"$out") / 1024))
log "Saved $out (${size_kb} KB)"
[[ "$size_kb" -le 5120 ]] || echo "warning: GIF is over 5 MB; try a smaller --width/--fps or trim it" >&2
