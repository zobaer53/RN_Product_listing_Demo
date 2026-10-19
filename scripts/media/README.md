# Showcase media pipeline

Reproducible README videos for Android and iOS. Each recording is placed in a device frame with a platform caption, so viewers can tell the devices apart at a glance: the Pixel has a punch-hole camera and right-side buttons, the iPhone has a Dynamic Island and a titanium rim. Each platform also keeps its own status bar and navigation.

Android is recorded on a **physical device** (primary: Google Pixel 6a over USB). iOS is recorded on the **iPhone 17 Pro simulator**.

```
prepare-devices.sh ─► record-android.sh ─┐                     ┌─► to-gif.sh ─► showcase-android.gif
   (clean status     record-ios.sh ──────┼─► frame-video.sh ───┤
    bars, 9:41)        (+ Maestro demo)  │   (device frame +   ├─► to-gif.sh ─► showcase-ios.gif
                                         │    caption)         └─► side-by-side.sh ─► showcase-side-by-side.mp4
make-showcase.sh runs all of the above ──┘
```

## Requirements

- macOS with Xcode command line tools (`xcrun simctl`, `swift`) and `ffmpeg`/`ffprobe`. No ffmpeg text filters are needed, because captions are rendered with Swift.
- Android SDK platform tools. `adb` comes from `$ANDROID_HOME` or `$ANDROID_SDK_ROOT`, else from `PATH`.
- Maestro CLI to drive the demo.
- The app installed on a connected Android device (USB debugging on) and on a booted iOS simulator.

## One command

```sh
npm run mock-api                     # only if the showcase flow uses mock scenarios
scripts/media/make-showcase.sh       # both platforms -> docs/media/
scripts/media/make-showcase.sh ios   # one platform
```

By default the demo is `maestro --device <id> test .maestro/showcase/showcase.yaml`, and it runs while the screen is recorded. During the Android recording `adb reverse tcp:4010 tcp:4010` is active, so the app on the phone reaches the host's mock API at `http://localhost:4010`. The forward is removed afterwards.

Useful overrides:

| Variable                                  | Purpose                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `ANDROID_SERIAL` / `IOS_UDID`             | Pick devices (default: first connected physical Android device / first booted simulator)         |
| `ANDROID_DEVICE_NAME` / `IOS_DEVICE_NAME` | Caption text (default: read from the device, e.g. `Google Pixel 6a` / `iPhone 17 Pro Simulator`) |
| `DEMO_CMD`                                | Custom demo command (`bash -c`, `$DEVICE_ID` set); `manual` = press Enter to stop                |
| `ANDROID_TRIM_START` / `IOS_TRIM_START`   | Cut idle seconds from the start (for example while Maestro starts up)                            |
| `MOCK_API_PORT`, `ADB_REVERSE=0`          | Port forwarded with `adb reverse` (default 4010), or skip the forward                            |
| `WORK_DIR`, `OUT_DIR`                     | Raw recordings (temp dir) and outputs (`docs/media`)                                             |

To re-frame existing raw recordings without recording again, run `scripts/media/make-showcase.sh --skip-record`.

## Individual steps

| Script                                                                          | What it does                                                                                                                                                                                                |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepare-devices.sh [ios\|android\|all] [--serial S] [--udid U] [--exit]`       | iOS: `simctl status_bar override` (9:41, charged, full bars). Android: SystemUI demo mode (09:41, battery 100, full Wi-Fi, no notifications). Vendor skins may ignore it (warning only). `--exit` restores. |
| `record-ios.sh out.mp4 [--udid ID] [-- cmd …]`                                  | `simctl io recordVideo --codec h264` while `cmd` runs, stops with SIGINT, converts to 30 fps CFR (simctl skips frames when nothing changes).                                                                |
| `record-android.sh out.mp4 [--serial S] [-- cmd …]`                             | `adb -s S shell screenrecord --bit-rate 8000000` at native size (1080×2400 on a Pixel 6a) in 170 s segments, because screenrecord stops at 3 min. Segments are pulled, joined and converted to 30 fps CFR.  |
| `frame-video.sh in.mp4 ios\|android out.mp4 [--device-name N] [--trim-start S]` | Scales the screen to 540 px wide, then overlays the rendered device frame (rounded screen, camera, buttons, shadow) and the caption. H.264 `yuv420p`, `+faststart`, CRF 28.                                 |
| `side-by-side.sh android.mp4 ios.mp4 out.mp4`                                   | `hstack` with bottom padding to equal height; the shorter clip holds its last frame (`tpad`).                                                                                                               |
| `to-gif.sh in.mp4 out.gif [--width 320] [--fps 12]`                             | Two-pass palette GIF preview (`palettegen`/`paletteuse`). Warns above 5 MB. `--start`/`--duration` trim it.                                                                                                 |
| `render-device.swift`, `render-caption.swift`                                   | CoreGraphics/AppKit renderers for the device frame and caption PNGs (used by `frame-video.sh`).                                                                                                             |

## Size budget

- Framed MP4: about 694 × 1400 px. A ~60 s app demo at CRF 28 is typically 2–6 MB. If it exceeds 10 MB, raise `CRF` (for example to 30) or lower `SCREEN_WIDTH`.
- GIF previews: 320 px at 12 fps. If one exceeds ~5 MB, lower `GIF_FPS`/`GIF_WIDTH` or trim it with `to-gif.sh --duration`.
- Raw recordings stay in `WORK_DIR`, outside the repository. Only the final files in `docs/media/` are committed.

## Tips

- Run the demo once before recording, so fonts and images are cached and the flow is smooth.
- Close other apps and clear notifications on the phone first. Demo mode hides most status icons, but not on every vendor skin.
- Record each platform separately. Both use the same flow, so the story matches side by side.
- If a run is interrupted, restore the status bars with `scripts/media/prepare-devices.sh --exit`, and remove the port forward with `adb reverse --remove tcp:4010`.
- Emulators also work (`ANDROID_SERIAL=emulator-5554`). If a large-screen emulator records a letterboxed 720×1280 video, pass `SIZE=720x1606` (or another size with the screen's aspect ratio).
