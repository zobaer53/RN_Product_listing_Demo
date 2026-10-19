#!/usr/bin/env bash
# Clean, identical-looking status bars for screen recordings (9:41, full battery and signal).
set -euo pipefail
source "$(dirname "$0")/common.sh"

usage() {
  cat <<'EOF'
Usage: prepare-devices.sh [ios|android|all] [--serial SERIAL] [--udid UDID] [--exit]

  ios       override the iOS simulator status bar (xcrun simctl status_bar)
  android   enable SystemUI demo mode on the Android device (Pixel/AOSP; some
            vendor skins such as One UI ignore it, which only produces a warning)
  all       both (default)
  --exit    restore the normal status bars instead

Environment:
  IOS_UDID        simulator UDID (default: first booted simulator)
  ANDROID_SERIAL  adb serial (default: first connected physical device)
EOF
}

target="all"
mode="enter"
while [[ $# -gt 0 ]]; do
  case "$1" in
    ios | android | all) target="$1"; shift ;;
    --serial) ANDROID_SERIAL="$2"; shift 2 ;;
    --udid) IOS_UDID="$2"; shift 2 ;;
    --exit) mode="exit"; shift ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

prepare_ios() {
  require xcrun
  local udid
  udid="$(ios_udid)"
  if [[ "$mode" == "exit" ]]; then
    xcrun simctl status_bar "$udid" clear
    log "iOS ($udid): status bar restored"
    return
  fi
  xcrun simctl status_bar "$udid" override \
    --time 9:41 --batteryState charged --batteryLevel 100 \
    --dataNetwork wifi --wifiMode active --wifiBars 3 \
    --cellularMode active --cellularBars 4 --operatorName ''
  log "iOS ($udid): status bar set to 9:41, full battery and signal"
}

prepare_android() {
  local adb serial
  adb="$(adb_bin)"
  serial="$(android_serial)"
  # Demo mode is best effort: a vendor SystemUI may reject or ignore it.
  demo() {
    "$adb" -s "$serial" shell am broadcast -a com.android.systemui.demo -e command "$@" >/dev/null ||
      echo "warning: demo command '$1' failed on $serial" >&2
  }

  if [[ "$mode" == "exit" ]]; then
    demo exit
    "$adb" -s "$serial" shell settings put global sysui_demo_allowed 0 || true
    log "Android ($serial): demo mode off"
    return
  fi
  if [[ "$("$adb" -s "$serial" shell getprop ro.product.manufacturer | tr -d '\r')" != "Google" ]]; then
    echo "warning: $serial is not a Google device; its SystemUI may ignore demo mode" >&2
  fi
  "$adb" -s "$serial" shell settings put global sysui_demo_allowed 1 ||
    echo "warning: could not allow demo mode on $serial" >&2
  demo enter
  demo clock -e hhmm 0941
  demo battery -e level 100 -e plugged false -e powersave false
  demo network -e wifi show -e level 4 -e fully true
  demo network -e mobile show -e datatype none -e level 4
  demo notifications -e visible false
  log "Android ($serial): demo mode on (09:41, full battery and signal, no notifications)"
}

case "$target" in
  ios) prepare_ios ;;
  android) prepare_android ;;
  all) prepare_android; prepare_ios ;;
esac
