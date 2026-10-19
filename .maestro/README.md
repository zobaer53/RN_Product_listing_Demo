# End-to-end flows (Maestro)

Black-box UI flows for Product Explorer (`com.zobaer53.productexplorer`). Every selector
uses the testIDs from `src/shared/testing/test-ids.ts`, so renaming an id there breaks
these flows.

```
.maestro/
  config.yaml          workspace config (runs flows/*)
  flows/               E2E-01 … E2E-13, one scenario per file
  subflows/            launch, set-scenario, scroll-to-end
  scripts/             JavaScript run by Maestro on the host
  showcase/            paced demo for screen recordings (not a test)
```

## Prerequisites

- Maestro CLI 2.x: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
- One target with the app installed (`npx expo run:android` / `npx expo run:ios`, or the
  CI debug APK):
  - a physical Android device over USB (local runs use a Pixel 6a; pick it with
    `maestro --device <serial> test …` when several devices are connected),
  - an Android emulator (CI), or
  - an iOS simulator.

The flows avoid device-specific assumptions: no screen coordinates, scrolling uses
`scrollUntilVisible`, and swipes are relative to an element.

## Two ways to run

### 1. Smoke against the real API

Flows tagged `smoke` only need the app pointed at `https://dummyjson.com` (the default).

```sh
maestro test --include-tags smoke .maestro/flows
```

### 2. Deterministic scenarios against the mock API

Flows tagged `mock` drive the local mock server (`npm run mock-api`, port 4010) through
`POST /__scenario` with a JSON body `{ "scenario": "<name>" }`.

The app always talks to the mock server as `http://localhost:4010`, on every target:

- Android (USB device or emulator): forward the device's port 4010 to the host with
  `adb reverse tcp:4010 tcp:4010` (run it again after reconnecting the device or rebooting
  the emulator). This replaces the emulator-only `10.0.2.2` alias.
- iOS simulator: shares the host network, `localhost` works as is.

Build or start the app with the mock base URL:

```sh
EXPO_PUBLIC_API_BASE_URL=http://localhost:4010 npx expo run:android
```

The scenario switch itself runs on the host, so `MOCK_API_URL` defaults to
`http://localhost:4010` and only needs overriding when the server runs elsewhere:

```sh
npm run mock-api &
adb reverse tcp:4010 tcp:4010
maestro test --include-tags mock .maestro/flows
maestro test -e MOCK_API_URL=http://192.168.1.20:4010 --include-tags mock .maestro/flows
```

Scenarios used by the flows (the mock server must implement them):

| Scenario       | Behaviour                                                |
| -------------- | -------------------------------------------------------- |
| `ok`           | normal paginated catalogue (default, restored after use) |
| `products-25`  | catalogue of 25 products (3 pages)                       |
| `empty`        | `total: 0`, no products                                  |
| `error-500`    | every request answers HTTP 500                           |
| `page2-error`  | first page works, `skip > 0` answers HTTP 500            |
| `not-found`    | product details answer HTTP 404                          |
| `network-down` | the server drops every connection                        |

## Tags

| Tag            | Flows                   | Notes                                    |
| -------------- | ----------------------- | ---------------------------------------- |
| `smoke`        | E2E-01, 04, 05, 11      | real API, run in CI on Android           |
| `pagination`   | E2E-02, 03, 08          | mock API                                 |
| `states`       | E2E-06, 07, 12          | mock API                                 |
| `offline`      | E2E-09, 10, 13          | see platform tags below                  |
| `android-only` | E2E-09, 10              | toggle airplane mode (`setAirplaneMode`) |
| `ios`          | E2E-13                  | approximates offline with `network-down` |
| `mock`         | everything using a mock | requires `npm run mock-api`              |

Typical runs:

```sh
# Android, everything
maestro test --exclude-tags ios .maestro/flows
# iOS, everything that can run on a simulator
maestro test --exclude-tags android-only .maestro/flows
# JUnit report (as in CI)
maestro test --include-tags smoke --format junit --output maestro-report.xml .maestro/flows
```

### Offline flows on a physical Android device

E2E-09 and E2E-10 toggle airplane mode with `setAirplaneMode`, which works on emulators
and on USB-connected devices. Airplane mode also cuts Wi-Fi, so a device attached through
wireless adb would drop off mid-flow; keep the device on a USB cable. Both flows switch
airplane mode back off when they finish, even on failure.

## Showcase

```sh
maestro record .maestro/showcase/showcase.yaml   # renders a video
maestro test .maestro/showcase/showcase.yaml     # or just plays it
```

Cold launch, scroll (loads the next page), open a product, swipe the gallery, read down to
the reviews, go back and pull to refresh.

## Checking syntax

```sh
maestro check-syntax .maestro/flows/e2e-01-list-loads.yaml
```
